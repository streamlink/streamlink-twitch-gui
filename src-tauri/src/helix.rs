use serde_json::Value;
use thiserror::Error;

use crate::auth::{self, AuthError};
use crate::http::shared_client;

#[derive(Debug, Error)]
pub enum HelixError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Auth(#[from] AuthError),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
}

/// Proxy a Helix GET so the OAuth access token never leaves the Rust side.
/// `query` is a list of key/value pairs; repeated keys are preserved
/// (Helix uses e.g. `?login=a&login=b`).
pub async fn fetch(path: &str, query: &[(String, String)]) -> Result<Value, HelixError> {
    let token = auth::token_for_api().await?;
    let client_id = auth::public_client_id()?;
    let mut url = url::Url::parse(&format!(
        "https://api.twitch.tv/helix/{}",
        path.trim_start_matches('/')
    ))
    .map_err(|e| HelixError::Message(format!("invalid helix path '{path}': {e}")))?;
    for (key, value) in query {
        url.query_pairs_mut().append_pair(key, value);
    }
    let res = shared_client()
        .get(url)
        .header("Client-Id", client_id)
        .bearer_auth(token)
        .send()
        .await?;
    let status = res.status();
    if !status.is_success() {
        let body = res.text().await.unwrap_or_default();
        return Err(HelixError::Message(format!("helix {status}: {body}")));
    }
    Ok(res.json().await?)
}
