use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};
use thiserror::Error;
use uuid::Uuid;

use crate::http::shared_client;

const SERVICE: &str = "streamlink-twitch-gui";
const USER: &str = "twitch-channel-points-tv-oauth";
const DEVICE_URL: &str = "https://id.twitch.tv/oauth2/device";
const TOKEN_URL: &str = "https://id.twitch.tv/oauth2/token";
const VALIDATE_URL: &str = "https://id.twitch.tv/oauth2/validate";
const TV_ORIGIN: &str = "https://android.tv.twitch.tv";
const TV_REFERER: &str = "https://android.tv.twitch.tv/";
const TV_USER_AGENT: &str = "Mozilla/5.0 (Linux; Android 7.1; Smart Box C1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
const SCOPES: &str = "chat:read";

pub(crate) const TV_CLIENT_ID: &str = "ue6666qo983tsx6so1t0vnawi233wa";

#[derive(Debug, Error)]
pub enum ChannelPointsAuthError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
    #[error(transparent)]
    Serde(#[from] serde_json::Error),
    #[error("keyring error: {0}")]
    Keyring(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StoredTvAuth {
    token: String,
    user_id: String,
    login: String,
    device_id: String,
}

#[derive(Debug, Clone)]
pub(crate) struct ChannelPointsAuthSession {
    pub token: String,
    pub user_id: String,
    pub login: String,
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelPointsAuthStatus {
    pub configured: bool,
    pub login: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct DeviceCodeBody {
    device_code: String,
    expires_in: u64,
    interval: u64,
    user_code: String,
    verification_uri: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TvDeviceCodeResponse {
    pub device_code: String,
    pub expires_in: u64,
    pub interval: u64,
    pub user_code: String,
    pub verification_uri: String,
}

impl From<DeviceCodeBody> for TvDeviceCodeResponse {
    fn from(value: DeviceCodeBody) -> Self {
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
struct TokenBody {
    access_token: String,
}

#[derive(Debug, Deserialize)]
struct TokenErrorBody {
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ValidateBody {
    client_id: String,
    login: String,
    user_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "state")]
pub enum TvDevicePoll {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "slowDown")]
    SlowDown,
    #[serde(rename = "done")]
    Done { status: ChannelPointsAuthStatus },
}

fn ensure_keyring() -> Result<(), ChannelPointsAuthError> {
    static INIT: OnceLock<Result<(), String>> = OnceLock::new();
    let result = INIT.get_or_init(|| {
        #[cfg(windows)]
        {
            let store =
                windows_native_keyring_store::Store::new().map_err(|error| error.to_string())?;
            keyring_core::set_default_store(store);
        }
        Ok(())
    });
    result.clone().map_err(ChannelPointsAuthError::Keyring)
}

fn entry() -> Result<Entry, ChannelPointsAuthError> {
    ensure_keyring()?;
    Entry::new(SERVICE, USER).map_err(|error| ChannelPointsAuthError::Keyring(error.to_string()))
}

fn load_auth() -> Result<Option<StoredTvAuth>, ChannelPointsAuthError> {
    match entry()?.get_password() {
        Ok(secret) => Ok(Some(serde_json::from_str(&secret)?)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(ChannelPointsAuthError::Keyring(error.to_string())),
    }
}

fn save_auth(auth: &StoredTvAuth) -> Result<(), ChannelPointsAuthError> {
    entry()?
        .set_password(&serde_json::to_string(auth)?)
        .map_err(|error| ChannelPointsAuthError::Keyring(error.to_string()))
}

fn clear_auth() -> Result<(), ChannelPointsAuthError> {
    match entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => Err(ChannelPointsAuthError::Keyring(error.to_string())),
    }
}

pub(crate) fn device_id() -> &'static str {
    static VALUE: OnceLock<String> = OnceLock::new();
    VALUE
        .get_or_init(|| {
            load_auth()
                .ok()
                .flatten()
                .map(|auth| auth.device_id)
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| Uuid::new_v4().simple().to_string())
        })
        .as_str()
}

pub(crate) fn client_session_id() -> &'static str {
    static VALUE: OnceLock<String> = OnceLock::new();
    VALUE
        .get_or_init(|| Uuid::new_v4().simple().to_string())
        .as_str()
}

fn tv_request(request: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
    request
        .header("Accept", "application/json")
        .header("Client-Id", TV_CLIENT_ID)
        .header("Origin", TV_ORIGIN)
        .header("Referer", TV_REFERER)
        .header("User-Agent", TV_USER_AGENT)
        .header("X-Device-Id", device_id())
}

fn pending_device_code() -> &'static Mutex<Option<String>> {
    static VALUE: OnceLock<Mutex<Option<String>>> = OnceLock::new();
    VALUE.get_or_init(|| Mutex::new(None))
}

pub fn get_status() -> Result<ChannelPointsAuthStatus, ChannelPointsAuthError> {
    let auth = load_auth()?;
    Ok(ChannelPointsAuthStatus {
        configured: auth.is_some(),
        login: auth.as_ref().map(|value| value.login.clone()),
        user_id: auth.as_ref().map(|value| value.user_id.clone()),
    })
}

pub(crate) fn load_session() -> Result<Option<ChannelPointsAuthSession>, ChannelPointsAuthError> {
    Ok(load_auth()?.map(|auth| ChannelPointsAuthSession {
        token: auth.token,
        user_id: auth.user_id,
        login: auth.login,
        device_id: auth.device_id,
    }))
}

pub async fn start_device_flow() -> Result<TvDeviceCodeResponse, ChannelPointsAuthError> {
    let response = tv_request(shared_client().post(DEVICE_URL))
        .form(&[("client_id", TV_CLIENT_ID), ("scopes", SCOPES)])
        .send()
        .await?;
    let status = response.status();
    if !status.is_success() {
        return Err(ChannelPointsAuthError::Message(format!(
            "Channel Points TV device login failed (HTTP {status})"
        )));
    }
    let body = response.json::<DeviceCodeBody>().await?;
    if let Ok(mut pending) = pending_device_code().lock() {
        *pending = Some(body.device_code.clone());
    }
    Ok(body.into())
}

async fn validate_token(token: &str) -> Result<ValidateBody, ChannelPointsAuthError> {
    let response = shared_client()
        .get(VALIDATE_URL)
        .header("Authorization", format!("OAuth {token}"))
        .send()
        .await?;
    let status = response.status();
    if !status.is_success() {
        return Err(ChannelPointsAuthError::Message(format!(
            "Twitch rejected the Channel Points TV token (HTTP {status})"
        )));
    }
    let validate = response.json::<ValidateBody>().await?;
    if validate.client_id != TV_CLIENT_ID {
        return Err(ChannelPointsAuthError::Message(
            "Twitch returned a Channel Points token for the wrong client".into(),
        ));
    }
    Ok(validate)
}

pub async fn poll_device_token(device_code: &str) -> Result<TvDevicePoll, ChannelPointsAuthError> {
    let expected = pending_device_code()
        .lock()
        .ok()
        .and_then(|pending| pending.clone());
    if expected.as_deref() != Some(device_code) {
        return Err(ChannelPointsAuthError::Message(
            "Channel Points TV device login is not active".into(),
        ));
    }

    let response = tv_request(shared_client().post(TOKEN_URL))
        .form(&[
            ("client_id", TV_CLIENT_ID),
            ("device_code", device_code),
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
        ])
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let error = response.json::<TokenErrorBody>().await.unwrap_or(TokenErrorBody {
            message: None,
        });
        return match error.message.as_deref() {
            Some("authorization_pending") => Ok(TvDevicePoll::Pending),
            Some("slow_down") => Ok(TvDevicePoll::SlowDown),
            Some("expired_token") | Some("access_denied") => Err(ChannelPointsAuthError::Message(
                error.message.unwrap_or_else(|| "Channel Points TV login failed".into()),
            )),
            _ => Err(ChannelPointsAuthError::Message(format!(
                "Channel Points TV token poll failed (HTTP {status})"
            ))),
        };
    }

    let token = response.json::<TokenBody>().await?;
    let validate = validate_token(&token.access_token).await?;
    let app_session = crate::auth::get_session()
        .await
        .map_err(|error| ChannelPointsAuthError::Message(error.to_string()))?;
    if !app_session.logged_in || app_session.user_id.as_deref() != Some(validate.user_id.as_str()) {
        return Err(ChannelPointsAuthError::Message(
            "Channel Points TV login belongs to a different Twitch account".into(),
        ));
    }

    let stored = StoredTvAuth {
        token: token.access_token,
        user_id: validate.user_id,
        login: validate.login,
        device_id: device_id().to_string(),
    };
    save_auth(&stored)?;
    if let Ok(mut pending) = pending_device_code().lock() {
        *pending = None;
    }
    Ok(TvDevicePoll::Done {
        status: ChannelPointsAuthStatus {
            configured: true,
            login: Some(stored.login),
            user_id: Some(stored.user_id),
        },
    })
}

pub fn clear() -> Result<ChannelPointsAuthStatus, ChannelPointsAuthError> {
    clear_auth()?;
    if let Ok(mut pending) = pending_device_code().lock() {
        *pending = None;
    }
    Ok(ChannelPointsAuthStatus {
        configured: false,
        login: None,
        user_id: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tv_identity_matches_current_miner_client() {
        assert_eq!(TV_CLIENT_ID, "ue6666qo983tsx6so1t0vnawi233wa");
        assert!(TV_ORIGIN.contains("android.tv.twitch.tv"));
        assert!(!device_id().is_empty());
        assert_eq!(device_id(), device_id());
        assert_eq!(client_session_id(), client_session_id());
    }
}
