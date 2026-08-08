use reqwest::header::{ACCEPT, AUTHORIZATION, REFERER, USER_AGENT};
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use thiserror::Error;
use uuid::Uuid;

use crate::http::shared_client;

const TWITCH_URL: &str = "https://www.twitch.tv";
const GQL_URL: &str = "https://gql.twitch.tv/gql";
const INTEGRITY_URL: &str = "https://gql.twitch.tv/integrity";
const BROWSER_CLIENT_ID: &str = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const USER_AGENT_VALUE: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const FALLBACK_CLIENT_VERSION: &str = "ef928475-9403-42f2-8a34-55784bd08e16";
const CHANNEL_POINTS_CONTEXT_HASHES: [&str; 2] = [
    "7fe050e3761eb2cf258d70ee1a21cbd76fa8cf3d7e7b12fc437e7029d446b5e3",
    "374314de591e69925fce3ddc2bcf085796f56ebb8cad67a0daa3165c03adc345",
];
const CLAIM_COMMUNITY_POINTS_HASH: &str =
    "46aaeebe02c99afdf4fc97c7c0cba964124bf6b0af229395f1f6d1feed05b3d0";
const CLIENT_VERSION_TTL: Duration = Duration::from_secs(30 * 60);
const INTEGRITY_REFRESH_SKEW_MS: u64 = 5 * 60 * 1000;
const INTEGRITY_FALLBACK_TTL_MS: u64 = 10 * 60 * 1000;

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
    channel_id: String,
    balance: u64,
    claim_id: Option<String>,
}

#[derive(Debug, Clone)]
struct IntegrityToken {
    token: String,
    expiration_ms: u64,
    auth_token: String,
}

fn device_id() -> &'static str {
    static VALUE: OnceLock<String> = OnceLock::new();
    VALUE
        .get_or_init(|| Uuid::new_v4().simple().to_string())
        .as_str()
}

fn client_session() -> &'static str {
    static VALUE: OnceLock<String> = OnceLock::new();
    VALUE
        .get_or_init(|| Uuid::new_v4().simple().to_string())
        .as_str()
}

fn client_version_cache() -> &'static Mutex<Option<(String, Instant)>> {
    static CACHE: OnceLock<Mutex<Option<(String, Instant)>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(None))
}

fn integrity_cache() -> &'static Mutex<Option<IntegrityToken>> {
    static CACHE: OnceLock<Mutex<Option<IntegrityToken>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(None))
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .try_into()
        .unwrap_or(u64::MAX)
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

fn integrity_error(body: &Value) -> bool {
    gql_error_message(body)
        .map(|message| message.to_ascii_lowercase().contains("integrity"))
        .unwrap_or(false)
}

fn normalize_integrity_expiration(raw: Option<u64>, now_ms: u64) -> u64 {
    let Some(mut expiration) = raw else {
        return now_ms.saturating_add(INTEGRITY_FALLBACK_TTL_MS);
    };
    if expiration < 10_000_000_000 {
        expiration = expiration.saturating_mul(1000);
    }
    if expiration <= now_ms {
        now_ms.saturating_add(INTEGRITY_FALLBACK_TTL_MS)
    } else {
        expiration
    }
}

async fn fetch_integrity_token(
    token: &str,
    client_version: &str,
    force_refresh: bool,
) -> Result<String, ChannelPointsError> {
    let now_ms = unix_time_ms();
    if !force_refresh {
        if let Ok(cache) = integrity_cache().lock() {
            if let Some(cached) = cache.as_ref() {
                if cached.auth_token == token
                    && cached.expiration_ms > now_ms.saturating_add(INTEGRITY_REFRESH_SKEW_MS)
                {
                    return Ok(cached.token.clone());
                }
            }
        }
    }

    let response = shared_client()
        .post(INTEGRITY_URL)
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("OAuth {token}"))
        .header("Client-Id", BROWSER_CLIENT_ID)
        .header("Client-Session-Id", client_session())
        .header("Client-Version", client_version)
        .header("X-Device-Id", device_id())
        .json(&json!({}))
        .send()
        .await
        .map_err(|error| {
            if error.is_timeout() {
                ChannelPointsError::Message("Twitch integrity request timed out".into())
            } else if error.is_connect() {
                ChannelPointsError::Message("Twitch integrity connection failed".into())
            } else {
                ChannelPointsError::Message("Twitch integrity request failed".into())
            }
        })?;

    let status = response.status();
    let body = response.json::<Value>().await.map_err(|_| {
        ChannelPointsError::Message(format!(
            "Twitch returned an invalid integrity response (HTTP {status})"
        ))
    })?;
    if !status.is_success() {
        return Err(ChannelPointsError::Message(format!(
            "Twitch rejected the integrity request (HTTP {status})"
        )));
    }

    let integrity = body
        .get("token")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ChannelPointsError::Message("Twitch returned no integrity token".into()))?
        .to_string();
    let expiration = body.get("expiration").and_then(|value| {
        value
            .as_u64()
            .or_else(|| value.as_str().and_then(|raw| raw.parse::<u64>().ok()))
    });
    let expiration_ms = normalize_integrity_expiration(expiration, now_ms);

    if let Ok(mut cache) = integrity_cache().lock() {
        *cache = Some(IntegrityToken {
            token: integrity.clone(),
            expiration_ms,
            auth_token: token.to_string(),
        });
    }

    Ok(integrity)
}

async fn post_gql(
    payload: &Value,
    channel_login: &str,
    token: &str,
    client_version: &str,
    integrity: Option<&str>,
) -> Result<(reqwest::StatusCode, Value), ChannelPointsError> {
    let mut request = shared_client()
        .post(GQL_URL)
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("OAuth {token}"))
        .header("Client-Id", BROWSER_CLIENT_ID)
        .header("Client-Session-Id", client_session())
        .header("Client-Version", client_version)
        .header("X-Device-Id", device_id())
        .header(REFERER, format!("{TWITCH_URL}/{channel_login}"));
    if let Some(integrity) = integrity {
        request = request
            .header("Client-Integrity", integrity)
            .header("Device-ID", device_id());
    }
    let response = request.json(payload).send().await.map_err(|error| {
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

fn claim_payload(channel_id: &str, claim_id: &str) -> Value {
    json!({
        "operationName": "ClaimCommunityPoints",
        "variables": {
            "input": {
                "channelID": channel_id,
                "claimID": claim_id
            }
        },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": CLAIM_COMMUNITY_POINTS_HASH
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
    let channel_id = channel
        .get("id")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ChannelPointsError::Message("Twitch returned no channel id".into()))?
        .to_string();
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

    Ok(ContextState {
        channel_id,
        balance,
        claim_id,
    })
}

async fn fetch_context(
    channel_login: &str,
    token: &str,
    client_version: &str,
) -> Result<ContextState, ChannelPointsError> {
    let mut last_error = None;
    for hash in CHANNEL_POINTS_CONTEXT_HASHES {
        let payload = context_payload(channel_login, hash);
        let (status, body) = post_gql(&payload, channel_login, token, client_version, None).await?;
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

async fn claim_bonus(
    channel_login: &str,
    channel_id: &str,
    claim_id: &str,
    token: &str,
    client_version: &str,
) -> Result<u16, ChannelPointsError> {
    let payload = claim_payload(channel_id, claim_id);
    let mut integrity = fetch_integrity_token(token, client_version, false).await?;

    for attempt in 0..=1 {
        let (status, body) = post_gql(
            &payload,
            channel_login,
            token,
            client_version,
            Some(&integrity),
        )
        .await?;

        if attempt == 0 && integrity_error(&body) {
            integrity = fetch_integrity_token(token, client_version, true).await?;
            continue;
        }
        if !status.is_success() {
            return Err(ChannelPointsError::Message(format!(
                "Twitch rejected the Channel Points bonus claim (HTTP {status})"
            )));
        }
        if let Some(message) = gql_error_message(&body) {
            return Err(ChannelPointsError::Message(message));
        }
        return Ok(status.as_u16());
    }

    Err(ChannelPointsError::Message(
        "Twitch rejected the Channel Points bonus claim".into(),
    ))
}

pub async fn refresh(raw_channel_login: &str) -> Result<ChannelPointsSnapshot, ChannelPointsError> {
    let channel_login = raw_channel_login.trim().to_ascii_lowercase();
    if !valid_login(&channel_login) {
        return Err(ChannelPointsError::Message(
            "invalid Twitch channel login".into(),
        ));
    }

    let token = crate::twitch_web_auth::load_token()
        .map_err(|error| ChannelPointsError::Message(error.to_string()))?
        .ok_or_else(|| {
            ChannelPointsError::Message("authenticated Twitch playback is not configured".into())
        })?;
    let website = crate::twitch_web_auth::get_status()
        .map_err(|error| ChannelPointsError::Message(error.to_string()))?;
    let session = crate::auth::get_session()
        .await
        .map_err(|error| ChannelPointsError::Message(error.to_string()))?;
    if !session.logged_in || website.user_id.as_deref() != session.user_id.as_deref() {
        return Err(ChannelPointsError::Message(
            "authenticated playback does not match the current Twitch account".into(),
        ));
    }

    let client_version = current_client_version().await;
    let mut context = fetch_context(&channel_login, &token, &client_version).await?;
    let mut bonus_claimed = false;
    let mut claim_http_status = None;
    let mut claim_error = None;

    if let Some(claim_id) = context.claim_id.clone() {
        match claim_bonus(
            &channel_login,
            &context.channel_id,
            &claim_id,
            &token,
            &client_version,
        )
        .await
        {
            Ok(status) => {
                claim_http_status = Some(status);
                bonus_claimed = true;

                // Refresh once after a successful claim so the displayed balance catches
                // up immediately. A transient refresh failure must not hide a claim that
                // Twitch already accepted.
                if let Ok(updated) = fetch_context(&channel_login, &token, &client_version).await {
                    context = updated;
                }
            }
            Err(error) => claim_error = Some(error.to_string()),
        }
    }

    Ok(ChannelPointsSnapshot {
        channel_login,
        balance: context.balance,
        bonus_available: context.claim_id.is_some(),
        bonus_claimed,
        claim_http_status,
        claim_error,
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
    fn builds_claim_payload() {
        let payload = claim_payload("123", "claim-456");
        assert_eq!(payload["operationName"], "ClaimCommunityPoints");
        assert_eq!(payload["variables"]["input"]["channelID"], "123");
        assert_eq!(payload["variables"]["input"]["claimID"], "claim-456");
        assert_eq!(
            payload["extensions"]["persistedQuery"]["sha256Hash"],
            CLAIM_COMMUNITY_POINTS_HASH
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
        assert_eq!(context.channel_id, "123");
        assert_eq!(context.balance, 18450);
        assert_eq!(context.claim_id.as_deref(), Some("claim-456"));
    }

    #[test]
    fn detects_integrity_failures() {
        assert!(integrity_error(&json!({
            "errors": [{ "message": "failed integrity check" }]
        })));
        assert!(!integrity_error(&json!({
            "errors": [{ "message": "some other GraphQL error" }]
        })));
    }

    #[test]
    fn normalizes_integrity_expiration_units() {
        let now_ms = 1_800_000_000_000;
        assert_eq!(
            normalize_integrity_expiration(Some(1_800_000_900_000), now_ms),
            1_800_000_900_000
        );
        assert_eq!(
            normalize_integrity_expiration(Some(1_800_000_900), now_ms),
            1_800_000_900_000
        );
        assert!(normalize_integrity_expiration(None, now_ms) > now_ms);
    }
}
