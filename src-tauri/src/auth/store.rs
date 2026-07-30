use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

const SERVICE: &str = "streamlink-twitch-gui";
const USER: &str = "twitch-oauth";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: Option<u64>,
    pub scopes: Vec<String>,
}

#[derive(Debug, Error)]
pub enum TokenStoreError {
    #[error("keyring error: {0}")]
    Keyring(String),
    #[error("serialize error: {0}")]
    Serde(#[from] serde_json::Error),
}

/// keyring 4 / keyring-core require an explicit default store. The v1 helper
/// can race under concurrent first access, so we install Windows Credential
/// Manager once ourselves before any Entry::new calls.
fn ensure_keyring() -> Result<(), TokenStoreError> {
    static INIT: OnceLock<Result<(), String>> = OnceLock::new();
    let result = INIT.get_or_init(|| {
        #[cfg(windows)]
        {
            let store = windows_native_keyring_store::Store::new().map_err(|e| e.to_string())?;
            keyring_core::set_default_store(store);
        }
        Ok(())
    });
    result.clone().map_err(TokenStoreError::Keyring)
}

fn entry() -> Result<Entry, TokenStoreError> {
    ensure_keyring()?;
    Entry::new(SERVICE, USER).map_err(|e| TokenStoreError::Keyring(e.to_string()))
}

pub fn load_tokens() -> Result<Option<StoredTokens>, TokenStoreError> {
    let entry = entry()?;
    match entry.get_password() {
        Ok(secret) => Ok(Some(serde_json::from_str(&secret)?)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(TokenStoreError::Keyring(e.to_string())),
    }
}

pub fn save_tokens(tokens: &StoredTokens) -> Result<(), TokenStoreError> {
    let entry = entry()?;
    let payload = serde_json::to_string(tokens)?;
    entry
        .set_password(&payload)
        .map_err(|e| TokenStoreError::Keyring(e.to_string()))
}

pub fn clear_tokens() -> Result<(), TokenStoreError> {
    let entry = entry()?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(TokenStoreError::Keyring(e.to_string())),
    }
}

pub fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}
