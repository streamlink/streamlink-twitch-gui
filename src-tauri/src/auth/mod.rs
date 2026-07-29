mod store;

use serde::{Deserialize, Serialize};
use thiserror::Error;

use store::{clear_tokens, load_tokens, now_unix, save_tokens, StoredTokens};

const AUTH_URL: &str = "https://id.twitch.tv/oauth2/device";
const TOKEN_URL: &str = "https://id.twitch.tv/oauth2/token";
const VALIDATE_URL: &str = "https://id.twitch.tv/oauth2/validate";
const REVOKE_URL: &str = "https://id.twitch.tv/oauth2/revoke";

pub const DEFAULT_SCOPES: &[&str] = &[
    "user:read:follows",
    "user:read:subscriptions",
    "user:read:blocked_users",
    "user:manage:blocked_users",
];

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
    #[error(transparent)]
    Store(#[from] store::TokenStoreError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub expires_in: u64,
    pub interval: u64,
    pub user_code: String,
    pub verification_uri: String,
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
    pub access_token: Option<String>,
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
    // Compile-time / runtime: prefer env, fall back to upstream public client-id for local dev.
    // Forks should set TWITCH_CLIENT_ID (and VITE_TWITCH_CLIENT_ID) to their own app.
    if let Ok(id) = std::env::var("TWITCH_CLIENT_ID") {
        if !id.is_empty() {
            return Ok(id);
        }
    }
    Ok("phiay4sq36lfv9zu7cbqwz2ndnesfd8".to_string())
}

fn http() -> Result<reqwest::Client, AuthError> {
    Ok(reqwest::Client::new())
}

pub async fn start_device_flow() -> Result<DeviceCodeResponse, AuthError> {
    let client_id = client_id()?;
    let scope = DEFAULT_SCOPES.join(" ");
    let http = http()?;
    let res = http
        .post(AUTH_URL)
        .form(&[("client_id", client_id.as_str()), ("scopes", scope.as_str())])
        .send()
        .await?;
    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(AuthError::Message(format!(
            "device code request failed ({status}): {body}"
        )));
    }
    Ok(res.json().await?)
}

pub async fn poll_device_token(device_code: &str) -> Result<Option<AuthSession>, AuthError> {
    let client_id = client_id()?;
    let http = http()?;
    let res = http
        .post(TOKEN_URL)
        .form(&[
            ("client_id", client_id.as_str()),
            (
                "grant_type",
                "urn:ietf:params:oauth:grant-type:device_code",
            ),
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
        return Ok(Some(session_from_tokens(stored).await?));
    }

    let status = res.status();
    let err: TokenErrorBody = res.json().await.unwrap_or(TokenErrorBody {
        message: None,
        status: None,
    });
    let message = err.message.unwrap_or_default();
    if message == "authorization_pending" || message == "slow_down" {
        return Ok(None);
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
    let http = http()?;
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
        clear_tokens()?;
        return Err(AuthError::Message(
            "session expired; please log in again".into(),
        ));
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
    let http = http()?;

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
        access_token: Some(tokens.access_token),
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
            access_token: None,
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
        let http = http()?;
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

pub async fn access_token() -> Result<String, AuthError> {
    let session = get_session().await?;
    session
        .access_token
        .ok_or_else(|| AuthError::Message("not logged in".into()))
}

pub fn public_client_id() -> Result<String, AuthError> {
    client_id()
}
