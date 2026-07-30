mod store;

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::http::shared_client;
use store::{clear_tokens, load_tokens, now_unix, save_tokens, StoredTokens};

const AUTH_URL: &str = "https://id.twitch.tv/oauth2/device";
const TOKEN_URL: &str = "https://id.twitch.tv/oauth2/token";
const VALIDATE_URL: &str = "https://id.twitch.tv/oauth2/validate";
const REVOKE_URL: &str = "https://id.twitch.tv/oauth2/revoke";

/// Least privilege: only what the UI actually calls (followed streams).
/// Blocked-user scopes were dropped — the app has no block/unblock feature.
pub const DEFAULT_SCOPES: &[&str] = &["user:read:follows", "user:read:subscriptions"];

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
    #[error(transparent)]
    Store(#[from] store::TokenStoreError),
}

/// Twitch returns snake_case; we re-serialize to camelCase for the frontend.
#[derive(Debug, Deserialize)]
struct TwitchDeviceCodeBody {
    device_code: String,
    expires_in: u64,
    interval: u64,
    user_code: String,
    verification_uri: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub expires_in: u64,
    pub interval: u64,
    pub user_code: String,
    pub verification_uri: String,
}

impl From<TwitchDeviceCodeBody> for DeviceCodeResponse {
    fn from(value: TwitchDeviceCodeBody) -> Self {
        Self {
            device_code: value.device_code,
            expires_in: value.expires_in,
            interval: value.interval,
            user_code: value.user_code,
            verification_uri: value.verification_uri,
        }
    }
}

#[derive(Debug, Deserialize)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: Option<u64>,
    scope: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct TokenErrorBody {
    message: Option<String>,
    #[allow(dead_code)]
    status: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSession {
    pub logged_in: bool,
    // The access token is intentionally NOT exposed to the frontend.
    // Helix calls are proxied through the `helix_fetch` command in Rust.
    pub user_id: Option<String>,
    pub login: Option<String>,
    pub display_name: Option<String>,
    pub profile_image_url: Option<String>,
    pub scopes: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct ValidateResponse {
    client_id: String,
    login: String,
    user_id: String,
    scopes: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct HelixUsersResponse {
    data: Vec<HelixUser>,
}

#[derive(Debug, Deserialize)]
struct HelixUser {
    id: String,
    login: String,
    display_name: String,
    profile_image_url: String,
}

fn client_id() -> Result<String, AuthError> {
    // Releases MUST set TWITCH_CLIENT_ID (and VITE_TWITCH_CLIENT_ID) to this
    // project's own registered Twitch application — rate limits, revocation
    // and ToS apply per application. The literal below is the upstream
    // streamlink-twitch-gui public client ID and only exists so local dev
    // builds work out of the box. Do not ship it in releases.
    if let Ok(id) = std::env::var("TWITCH_CLIENT_ID") {
        if !id.is_empty() {
            return Ok(id);
        }
    }
    Ok("phiay4sq36lfv9zu7cbqwz2ndnesfd8".to_string())
}

fn http() -> &'static reqwest::Client {
    shared_client()
}

pub async fn start_device_flow() -> Result<DeviceCodeResponse, AuthError> {
    let client_id = client_id()?;
    let scope = DEFAULT_SCOPES.join(" ");
    let http = http();
    let res = http
        .post(AUTH_URL)
        .form(&[
            ("client_id", client_id.as_str()),
            ("scopes", scope.as_str()),
        ])
        .send()
        .await?;
    let status = res.status();
    let body = res.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(AuthError::Message(format!(
            "device code request failed ({status}): {body}"
        )));
    }
    serde_json::from_str::<TwitchDeviceCodeBody>(&body)
        .map(DeviceCodeResponse::from)
        .map_err(|e| {
            AuthError::Message(format!(
                "device code response decode failed: {e}; body={body}"
            ))
        })
}

/// Result of one device-flow poll. `SlowDown` is distinct from `Pending` so
/// the frontend can increase its interval as RFC 8628 requires (Twitch
/// enforces this and rate-limits clients that ignore it).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "state")]
pub enum DevicePoll {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "slowDown")]
    SlowDown,
    #[serde(rename = "done")]
    Done { session: AuthSession },
}

pub async fn poll_device_token(device_code: &str) -> Result<DevicePoll, AuthError> {
    let client_id = client_id()?;
    let http = http();
    let res = http
        .post(TOKEN_URL)
        .form(&[
            ("client_id", client_id.as_str()),
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ("device_code", device_code),
        ])
        .send()
        .await?;

    if res.status().is_success() {
        let token: TokenResponse = res.json().await?;
        let stored = StoredTokens {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: token.expires_in.map(|s| now_unix().saturating_add(s)),
            scopes: token.scope.unwrap_or_default(),
        };
        save_tokens(&stored)?;
        return Ok(DevicePoll::Done {
            session: session_from_tokens(stored).await?,
        });
    }

    let status = res.status();
    let err: TokenErrorBody = res.json().await.unwrap_or(TokenErrorBody {
        message: None,
        status: None,
    });
    let message = err.message.unwrap_or_default();
    if message == "authorization_pending" {
        return Ok(DevicePoll::Pending);
    }
    if message == "slow_down" {
        return Ok(DevicePoll::SlowDown);
    }
    if message == "expired_token" || message == "access_denied" {
        return Err(AuthError::Message(message));
    }
    Err(AuthError::Message(format!(
        "token poll failed ({status}): {message}"
    )))
}

async fn refresh_if_needed(mut tokens: StoredTokens) -> Result<StoredTokens, AuthError> {
    let needs_refresh = tokens
        .expires_at
        .map(|exp| now_unix() + 60 >= exp)
        .unwrap_or(false);
    if !needs_refresh {
        return Ok(tokens);
    }
    let Some(refresh) = tokens.refresh_token.clone() else {
        return Ok(tokens);
    };
    let client_id = client_id()?;
    let http = http();
    let res = http
        .post(TOKEN_URL)
        .form(&[
            ("client_id", client_id.as_str()),
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh.as_str()),
        ])
        .send()
        .await?;
    if !res.status().is_success() {
        let status = res.status();
        // Only wipe the stored session when Twitch definitively rejects the
        // refresh token. A transient 5xx must not force a full re-login.
        if status.as_u16() == 400 || status.as_u16() == 401 {
            clear_tokens()?;
            return Err(AuthError::Message(
                "session expired; please log in again".into(),
            ));
        }
        return Err(AuthError::Message(format!(
            "token refresh failed ({status}); will retry later"
        )));
    }
    let token: TokenResponse = res.json().await?;
    tokens = StoredTokens {
        access_token: token.access_token,
        refresh_token: token.refresh_token.or(tokens.refresh_token),
        expires_at: token.expires_in.map(|s| now_unix().saturating_add(s)),
        scopes: token.scope.unwrap_or(tokens.scopes),
    };
    save_tokens(&tokens)?;
    Ok(tokens)
}

async fn session_from_tokens(tokens: StoredTokens) -> Result<AuthSession, AuthError> {
    let tokens = refresh_if_needed(tokens).await?;
    let client_id = client_id()?;
    let http = http();

    let validate: ValidateResponse = http
        .get(VALIDATE_URL)
        .bearer_auth(&tokens.access_token)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    if validate.client_id != client_id {
        // Still usable, but warn via scopes/session only
    }

    let users: HelixUsersResponse = http
        .get("https://api.twitch.tv/helix/users")
        .header("Client-Id", &client_id)
        .bearer_auth(&tokens.access_token)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    let user = users.data.into_iter().next();
    Ok(AuthSession {
        logged_in: true,
        user_id: user
            .as_ref()
            .map(|u| u.id.clone())
            .or(Some(validate.user_id)),
        login: user
            .as_ref()
            .map(|u| u.login.clone())
            .or(Some(validate.login)),
        display_name: user.as_ref().map(|u| u.display_name.clone()),
        profile_image_url: user.as_ref().map(|u| u.profile_image_url.clone()),
        scopes: validate.scopes,
    })
}

pub async fn get_session() -> Result<AuthSession, AuthError> {
    match load_tokens()? {
        Some(tokens) => session_from_tokens(tokens).await,
        None => Ok(AuthSession {
            logged_in: false,
            user_id: None,
            login: None,
            display_name: None,
            profile_image_url: None,
            scopes: vec![],
        }),
    }
}

pub async fn logout() -> Result<(), AuthError> {
    if let Some(tokens) = load_tokens()? {
        let client_id = client_id()?;
        let http = http();
        let _ = http
            .post(REVOKE_URL)
            .form(&[
                ("client_id", client_id.as_str()),
                ("token", tokens.access_token.as_str()),
            ])
            .send()
            .await;
    }
    clear_tokens()?;
    Ok(())
}

/// Lightweight token accessor for the Helix proxy: refreshes when needed but
/// skips the validate + /helix/users round trips (those only matter for the
/// account UI, not for attaching a Bearer header).
pub async fn token_for_api() -> Result<String, AuthError> {
    let tokens = load_tokens()?.ok_or_else(|| AuthError::Message("not logged in".into()))?;
    let tokens = refresh_if_needed(tokens).await?;
    Ok(tokens.access_token)
}

pub fn public_client_id() -> Result<String, AuthError> {
    client_id()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_twitch_device_code_snake_case() {
        let body = r#"{
            "device_code":"abc",
            "expires_in":1800,
            "interval":5,
            "user_code":"ABCD1234",
            "verification_uri":"https://www.twitch.tv/activate?device-code=ABCD1234"
        }"#;
        let parsed: TwitchDeviceCodeBody = serde_json::from_str(body).unwrap();
        let dto = DeviceCodeResponse::from(parsed);
        assert_eq!(dto.user_code, "ABCD1234");
        assert_eq!(dto.interval, 5);
        let json = serde_json::to_string(&dto).unwrap();
        assert!(json.contains("userCode"));
        assert!(json.contains("verificationUri"));
    }
}
