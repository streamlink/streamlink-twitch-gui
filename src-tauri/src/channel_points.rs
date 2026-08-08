use reqwest::header::{ACCEPT, AUTHORIZATION, REFERER, USER_AGENT};
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};
use thiserror::Error;

use crate::http::shared_client;

const TWITCH_URL: &str = "https://www.twitch.tv";
const GQL_URL: &str = "https://gql.twitch.tv/gql";
const USER_AGENT_VALUE: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const FALLBACK_CLIENT_VERSION: &str = "ef928475-9403-42f2-8a34-55784bd08e16";
const CHANNEL_POINTS_CONTEXT_HASHES: [&str; 2] = [
    "7fe050e3761eb2cf258d70ee1a21cbd76fa8cf3d7e7b12fc437e7029d446b5e3",
    "374314de591e69925fce3ddc2bcf085796f56ebb8cad67a0daa3165c03adc345",
];
const CLIENT_VERSION_TTL: Duration = Duration::from_secs(30 * 60);

#[derive(Debug, Error)]
pub enum ChannelPointsError {
    #[error("{0}")]
    Message(String),
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelPointsSnapshot {
    pub channel_login: String,
    pub balance: u64,
    pub bonus_available: bool,
    pub bonus_claimed: bool,
    pub claim_http_status: Option<u16>,
    pub claim_error: Option<String>,
}

#[derive(Debug, Clone)]
struct ContextState {
    balance: u64,
    claim_id: Option<String>,
}

fn client_version_cache() -> &'static Mutex<Option<(String, Instant)>> {
    static CACHE: OnceLock<Mutex<Option<(String, Instant)>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(None))
}

fn valid_login(login: &str) -> bool {
    !login.is_empty()
        && login.len() <= 25
        && login.chars().all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '_'
        })
}

async fn current_client_version() -> String {
    if let Ok(cache) = client_version_cache().lock() {
        if let Some((version, stored_at)) = cache.as_ref() {
            if stored_at.elapsed() < CLIENT_VERSION_TTL {
                return version.clone();
            }
        }
    }

    let discovered = match shared_client()
        .get(TWITCH_URL)
        .header(USER_AGENT, USER_AGENT_VALUE)
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => match response.text().await {
            Ok(html) => crate::viewer_presence::extract_client_version(&html),
            Err(_) => None,
        },
        _ => None,
    }
    .unwrap_or_else(|| FALLBACK_CLIENT_VERSION.to_string());

    if let Ok(mut cache) = client_version_cache().lock() {
        *cache = Some((discovered.clone(), Instant::now()));
    }
    discovered
}

fn gql_error_message(body: &Value) -> Option<String> {
    body.get("errors")
        .and_then(Value::as_array)
        .and_then(|errors| {
            errors.iter().find_map(|error| {
                error
                    .get("message")
                    .and_then(Value::as_str)
                    .map(|message| message.chars().take(240).collect::<String>())
            })
        })
}

async fn post_gql(
    payload: &Value,
    channel_login: &str,
    token: &str,
    client_version: &str,
) -> Result<(reqwest::StatusCode, Value), ChannelPointsError> {
    let response = shared_client()
        .post(GQL_URL)
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("Bearer {token}"))
        .header("Client-Id", crate::channel_points_auth::TV_CLIENT_ID)
        .header(
            "Client-Session-Id",
            crate::channel_points_auth::client_session_id(),
        )
        .header("Client-Version", client_version)
        .header("X-Device-Id", crate::channel_points_auth::device_id())
        .header(REFERER, format!("{TWITCH_URL}/{channel_login}"))
        .json(payload)
        .send()
        .await
        .map_err(|error| {
            if error.is_timeout() {
                ChannelPointsError::Message("Twitch Channel Points request timed out".into())
            } else if error.is_connect() {
                ChannelPointsError::Message("Twitch Channel Points connection failed".into())
            } else {
                ChannelPointsError::Message("Twitch Channel Points request failed".into())
            }
        })?;

    let status = response.status();
    let body = response.json::<Value>().await.map_err(|_| {
        ChannelPointsError::Message(format!(
            "Twitch returned an invalid Channel Points response (HTTP {status})"
        ))
    })?;
    Ok((status, body))
}

fn context_payload(channel_login: &str, hash: &str) -> Value {
    json!({
        "operationName": "ChannelPointsContext",
        "variables": { "channelLogin": channel_login },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": hash
            }
        }
    })
}

fn parse_context(body: &Value) -> Result<ContextState, ChannelPointsError> {
    if let Some(message) = gql_error_message(body) {
        return Err(ChannelPointsError::Message(message));
    }

    let channel = body
        .pointer("/data/community/channel")
        .ok_or_else(|| ChannelPointsError::Message("Channel Points are unavailable".into()))?;
    let community_points = channel.pointer("/self/communityPoints").ok_or_else(|| {
        ChannelPointsError::Message("Twitch returned no Channel Points state".into())
    })?;
    let balance = community_points
        .get("balance")
        .and_then(Value::as_u64)
        .ok_or_else(|| {
            ChannelPointsError::Message("Twitch returned no Channel Points balance".into())
        })?;
    let claim_id = community_points
        .pointer("/availableClaim/id")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    Ok(ContextState { balance, claim_id })
}

async fn fetch_context(
    channel_login: &str,
    token: &str,
    client_version: &str,
) -> Result<ContextState, ChannelPointsError> {
    let mut last_error = None;
    for hash in CHANNEL_POINTS_CONTEXT_HASHES {
        let payload = context_payload(channel_login, hash);
        let (status, body) = post_gql(&payload, channel_login, token, client_version).await?;
        if !status.is_success() {
            last_error = Some(ChannelPointsError::Message(format!(
                "Twitch rejected ChannelPointsContext (HTTP {status})"
            )));
            continue;
        }
        match parse_context(&body) {
            Ok(context) => return Ok(context),
            Err(error) => last_error = Some(error),
        }
    }

    Err(last_error.unwrap_or_else(|| {
        ChannelPointsError::Message("Twitch ChannelPointsContext failed".into())
    }))
}

pub async fn refresh(raw_channel_login: &str) -> Result<ChannelPointsSnapshot, ChannelPointsError> {
    let channel_login = raw_channel_login.trim().to_ascii_lowercase();
    if !valid_login(&channel_login) {
        return Err(ChannelPointsError::Message(
            "invalid Twitch channel login".into(),
        ));
    }

    let points_auth = crate::channel_points_auth::load_session()
        .map_err(|error| ChannelPointsError::Message(error.to_string()))?
        .ok_or_else(|| {
            ChannelPointsError::Message("Channel Points TV login is not configured".into())
        })?;
    let session = crate::auth::get_session()
        .await
        .map_err(|error| ChannelPointsError::Message(error.to_string()))?;
    if !session.logged_in || session.user_id.as_deref() != Some(points_auth.user_id.as_str()) {
        return Err(ChannelPointsError::Message(
            "Channel Points TV login does not match the current Twitch account".into(),
        ));
    }

    let client_version = current_client_version().await;
    let context = fetch_context(&channel_login, &points_auth.token, &client_version).await?;

    Ok(ChannelPointsSnapshot {
        channel_login,
        balance: context.balance,
        bonus_available: context.claim_id.is_some(),
        bonus_claimed: false,
        claim_http_status: None,
        claim_error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_channel_points_context_payload() {
        let payload = context_payload("example", CHANNEL_POINTS_CONTEXT_HASHES[0]);
        assert_eq!(payload["operationName"], "ChannelPointsContext");
        assert_eq!(payload["variables"]["channelLogin"], "example");
        assert_eq!(
            payload["extensions"]["persistedQuery"]["sha256Hash"],
            CHANNEL_POINTS_CONTEXT_HASHES[0]
        );
    }

    #[test]
    fn parses_balance_and_available_claim() {
        let body = json!({
            "data": {
                "community": {
                    "channel": {
                        "id": "123",
                        "self": {
                            "communityPoints": {
                                "balance": 18450,
                                "availableClaim": { "id": "claim-456" }
                            }
                        }
                    }
                }
            }
        });
        let context = parse_context(&body).unwrap();
        assert_eq!(context.balance, 18450);
        assert_eq!(context.claim_id.as_deref(), Some("claim-456"));
    }
}
