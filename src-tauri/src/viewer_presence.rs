use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use thiserror::Error;

use crate::http::shared_client;

const TWITCH_URL: &str = "https://www.twitch.tv";
const USER_AGENT: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36";
const SUCCESS_INTERVAL: Duration = Duration::from_secs(20);
const MAX_WORKERS: usize = 2;

#[derive(Debug, Error)]
pub enum ViewerPresenceError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ViewerPresenceTarget {
    pub session_id: String,
    pub channel_login: String,
    pub channel_id: String,
    pub broadcast_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewerPresenceStatus {
    pub enabled: bool,
    pub active_session_ids: Vec<String>,
    pub limited: bool,
}

struct Worker {
    target: ViewerPresenceTarget,
    cancel: Arc<AtomicBool>,
}

pub struct ViewerPresenceState {
    workers: Mutex<HashMap<String, Worker>>,
}

pub type SharedViewerPresence = Arc<ViewerPresenceState>;

impl ViewerPresenceState {
    pub fn new() -> Self {
        Self {
            workers: Mutex::new(HashMap::new()),
        }
    }
}

fn valid_login(login: &str) -> bool {
    !login.is_empty()
        && login.len() <= 25
        && login.chars().all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '_'
        })
}

fn normalize_target(mut target: ViewerPresenceTarget) -> Option<ViewerPresenceTarget> {
    target.session_id = target.session_id.trim().to_string();
    target.channel_login = target.channel_login.trim().to_ascii_lowercase();
    target.channel_id = target.channel_id.trim().to_string();
    target.broadcast_id = target.broadcast_id.trim().to_string();

    if target.session_id.is_empty()
        || target.session_id.len() > 128
        || !valid_login(&target.channel_login)
        || target.channel_id.is_empty()
        || target.channel_id.len() > 32
        || !target
            .channel_id
            .chars()
            .all(|character| character.is_ascii_digit())
        || target.broadcast_id.is_empty()
        || target.broadcast_id.len() > 128
    {
        return None;
    }
    Some(target)
}

pub(crate) fn select_targets(targets: Vec<ViewerPresenceTarget>) -> Vec<ViewerPresenceTarget> {
    let mut seen = HashSet::new();
    targets
        .into_iter()
        .filter_map(normalize_target)
        .filter(|target| seen.insert(target.session_id.clone()))
        .take(MAX_WORKERS)
        .collect()
}

pub fn cancel_all(state: &ViewerPresenceState) {
    if let Ok(mut workers) = state.workers.lock() {
        for worker in workers.values() {
            worker.cancel.store(true, Ordering::Release);
        }
        workers.clear();
    }
}

fn status(
    state: &ViewerPresenceState,
    enabled: bool,
    limited: bool,
) -> Result<ViewerPresenceStatus, ViewerPresenceError> {
    let workers = state
        .workers
        .lock()
        .map_err(|_| ViewerPresenceError::Message("viewer presence state poisoned".into()))?;
    let mut active_session_ids = workers.keys().cloned().collect::<Vec<_>>();
    active_session_ids.sort();
    Ok(ViewerPresenceStatus {
        enabled,
        active_session_ids,
        limited,
    })
}

pub async fn sync(
    state: SharedViewerPresence,
    enabled: bool,
    targets: Vec<ViewerPresenceTarget>,
) -> Result<ViewerPresenceStatus, ViewerPresenceError> {
    if !enabled {
        cancel_all(&state);
        return status(&state, false, false);
    }

    let original_count = targets.len();
    let selected = select_targets(targets);
    let limited = original_count > selected.len() && selected.len() == MAX_WORKERS;
    if selected.is_empty() {
        cancel_all(&state);
        return status(&state, true, limited);
    }

    let _website_token = crate::twitch_web_auth::load_token()
        .map_err(|error| ViewerPresenceError::Message(error.to_string()))?
        .ok_or_else(|| {
            ViewerPresenceError::Message("authenticated Twitch playback is not configured".into())
        })?;
    let website = crate::twitch_web_auth::get_status()
        .map_err(|error| ViewerPresenceError::Message(error.to_string()))?;
    let session = crate::auth::get_session()
        .await
        .map_err(|error| ViewerPresenceError::Message(error.to_string()))?;
    let viewer_id = session.user_id.ok_or_else(|| {
        ViewerPresenceError::Message("log in with Twitch before enabling channel points".into())
    })?;
    if !session.logged_in || website.user_id.as_deref() != Some(viewer_id.as_str()) {
        cancel_all(&state);
        return Err(ViewerPresenceError::Message(
            "authenticated playback does not match the current Twitch account".into(),
        ));
    }

    let desired = selected
        .iter()
        .map(|target| (target.session_id.clone(), target.clone()))
        .collect::<HashMap<_, _>>();
    let mut spawn = Vec::new();
    {
        let mut workers = state
            .workers
            .lock()
            .map_err(|_| ViewerPresenceError::Message("viewer presence state poisoned".into()))?;
        workers.retain(|session_id, worker| {
            let keep = desired.get(session_id) == Some(&worker.target);
            if !keep {
                worker.cancel.store(true, Ordering::Release);
            }
            keep
        });

        for target in selected {
            if workers.contains_key(&target.session_id) {
                continue;
            }
            let cancel = Arc::new(AtomicBool::new(false));
            workers.insert(
                target.session_id.clone(),
                Worker {
                    target: target.clone(),
                    cancel: cancel.clone(),
                },
            );
            spawn.push((target, cancel));
        }
    }

    for (target, cancel) in spawn {
        let worker_state = state.clone();
        let worker_viewer_id = viewer_id.clone();
        tauri::async_runtime::spawn(async move {
            run_worker(worker_state, target, worker_viewer_id, cancel).await;
        });
    }

    status(&state, true, limited)
}

async fn run_worker(
    state: SharedViewerPresence,
    target: ViewerPresenceTarget,
    viewer_id: String,
    cancel: Arc<AtomicBool>,
) {
    let mut endpoint: Option<String> = None;
    let mut failures = 0u32;

    loop {
        if cancel.load(Ordering::Acquire) || !website_auth_still_matches(&viewer_id) {
            break;
        }

        if endpoint.is_none() {
            endpoint = resolve_spade_url(&target.channel_login).await.ok();
        }

        let accepted = if let Some(url) = endpoint.as_deref() {
            send_minute_watched(url, &target, &viewer_id)
                .await
                .unwrap_or(false)
        } else {
            false
        };

        let delay = if accepted {
            failures = 0;
            SUCCESS_INTERVAL
        } else {
            failures = failures.saturating_add(1);
            endpoint = None;
            failure_delay(failures)
        };
        if wait_or_cancel(&cancel, delay).await {
            break;
        }
    }

    if let Ok(mut workers) = state.workers.lock() {
        let should_remove = workers
            .get(&target.session_id)
            .map(|worker| Arc::ptr_eq(&worker.cancel, &cancel))
            .unwrap_or(false);
        if should_remove {
            workers.remove(&target.session_id);
        }
    }
}

fn website_auth_still_matches(viewer_id: &str) -> bool {
    if crate::twitch_web_auth::load_token()
        .ok()
        .flatten()
        .is_none()
    {
        return false;
    }
    crate::twitch_web_auth::get_status()
        .ok()
        .and_then(|status| status.user_id)
        .as_deref()
        == Some(viewer_id)
}

fn failure_delay(failures: u32) -> Duration {
    let exponent = failures.saturating_sub(1).min(4);
    Duration::from_secs((30u64.saturating_mul(1u64 << exponent)).min(300))
}

async fn wait_or_cancel(cancel: &AtomicBool, duration: Duration) -> bool {
    let mut remaining = duration.as_secs();
    while remaining > 0 {
        if cancel.load(Ordering::Acquire) {
            return true;
        }
        tokio::time::sleep(Duration::from_secs(1)).await;
        remaining -= 1;
    }
    cancel.load(Ordering::Acquire)
}

async fn resolve_spade_url(channel_login: &str) -> Result<String, ViewerPresenceError> {
    let page_url = format!("{TWITCH_URL}/{channel_login}");
    let page = shared_client()
        .get(page_url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await?
        .error_for_status()?
        .text()
        .await?;
    let settings_url = extract_settings_url(&page).ok_or_else(|| {
        ViewerPresenceError::Message("Twitch runtime settings URL was not found".into())
    })?;
    validate_https_url(&settings_url)?;

    let settings = shared_client()
        .get(settings_url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await?
        .error_for_status()?
        .text()
        .await?;
    let spade_url = extract_spade_url(&settings).ok_or_else(|| {
        ViewerPresenceError::Message("Twitch Spade endpoint was not found".into())
    })?;
    validate_https_url(&spade_url)?;
    Ok(spade_url)
}

fn validate_https_url(raw: &str) -> Result<(), ViewerPresenceError> {
    let parsed = url::Url::parse(raw)
        .map_err(|_| ViewerPresenceError::Message("invalid Twitch runtime URL".into()))?;
    if parsed.scheme() != "https" || parsed.host_str().is_none() {
        return Err(ViewerPresenceError::Message(
            "Twitch runtime URL must use HTTPS".into(),
        ));
    }
    Ok(())
}

pub(crate) fn extract_settings_url(html: &str) -> Option<String> {
    const PREFIXES: [&str; 2] = [
        "https://static.twitchcdn.net/config/settings",
        "https://assets.twitch.tv/config/settings",
    ];
    PREFIXES.iter().find_map(|prefix| {
        let start = html.find(prefix)?;
        let tail = &html[start..];
        let end = tail
            .find(|character: char| {
                character == '"'
                    || character == '\''
                    || character == '<'
                    || character.is_whitespace()
            })
            .unwrap_or(tail.len());
        Some(tail[..end].replace("\\/", "/"))
    })
}

pub(crate) fn extract_spade_url(settings: &str) -> Option<String> {
    const PATTERNS: [&str; 2] = ["\"spade_url\":\"", "\\\"spade_url\\\":\\\""];
    PATTERNS.iter().find_map(|pattern| {
        let start = settings.find(pattern)? + pattern.len();
        let tail = &settings[start..];
        let end = if pattern.starts_with("\\\"") {
            tail.find("\\\"")?
        } else {
            tail.find('"')?
        };
        Some(tail[..end].replace("\\/", "/"))
    })
}

async fn send_minute_watched(
    endpoint: &str,
    target: &ViewerPresenceTarget,
    viewer_id: &str,
) -> Result<bool, ViewerPresenceError> {
    let payload = build_minute_watched_payload(target, viewer_id);
    let encoded = base64_encode(payload.as_bytes());
    let response = shared_client()
        .post(endpoint)
        .header("User-Agent", USER_AGENT)
        .form(&[("data", encoded.as_str())])
        .send()
        .await?;
    Ok(response.status() == StatusCode::NO_CONTENT)
}

pub(crate) fn build_minute_watched_payload(
    target: &ViewerPresenceTarget,
    viewer_id: &str,
) -> String {
    serde_json::json!([{
        "event": "minute-watched",
        "properties": {
            "channel_id": target.channel_id,
            "broadcast_id": target.broadcast_id,
            "player": "site",
            "user_id": viewer_id,
            "live": true,
            "channel": target.channel_login.to_ascii_lowercase()
        }
    }])
    .to_string()
}

pub(crate) fn base64_encode(input: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut output = String::with_capacity(input.len().div_ceil(3) * 4);
    let mut index = 0;
    while index < input.len() {
        let first = input[index];
        let second = input.get(index + 1).copied();
        let third = input.get(index + 2).copied();

        output.push(ALPHABET[(first >> 2) as usize] as char);
        output.push(
            ALPHABET[(((first & 0b0000_0011) << 4) | second.unwrap_or(0) >> 4) as usize] as char,
        );
        match second {
            Some(second) => output.push(
                ALPHABET[(((second & 0b0000_1111) << 2) | third.unwrap_or(0) >> 6) as usize]
                    as char,
            ),
            None => output.push('='),
        }
        match third {
            Some(third) => output.push(ALPHABET[(third & 0b0011_1111) as usize] as char),
            None => output.push('='),
        }
        index += 3;
    }
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    fn target(session_id: &str, login: &str) -> ViewerPresenceTarget {
        ViewerPresenceTarget {
            session_id: session_id.into(),
            channel_login: login.into(),
            channel_id: "1234".into(),
            broadcast_id: format!("broadcast-{session_id}"),
        }
    }

    #[test]
    fn base64_encodes_without_padding_errors() {
        assert_eq!(base64_encode(b""), "");
        assert_eq!(base64_encode(b"f"), "Zg==");
        assert_eq!(base64_encode(b"fo"), "Zm8=");
        assert_eq!(base64_encode(b"foo"), "Zm9v");
        assert_eq!(base64_encode(b"foobar"), "Zm9vYmFy");
    }

    #[test]
    fn payload_uses_real_stream_and_viewer_identifiers() {
        let value = build_minute_watched_payload(&target("s1", "Example_Channel"), "9001");
        let parsed: serde_json::Value = serde_json::from_str(&value).unwrap();
        let properties = &parsed[0]["properties"];

        assert_eq!(parsed[0]["event"], "minute-watched");
        assert_eq!(properties["channel_id"], "1234");
        assert_eq!(properties["broadcast_id"], "broadcast-s1");
        assert_eq!(properties["user_id"], "9001");
        assert_eq!(properties["channel"], "example_channel");
        assert_eq!(properties["player"], "site");
        assert_eq!(properties["live"], true);
    }

    #[test]
    fn selection_deduplicates_valid_targets_and_caps_at_two() {
        let selected = select_targets(vec![
            target("s1", "one"),
            target("s1", "duplicate"),
            target("s2", "two"),
            target("s3", "three"),
            ViewerPresenceTarget {
                session_id: "bad".into(),
                channel_login: "invalid-login".into(),
                channel_id: "not-digits".into(),
                broadcast_id: "".into(),
            },
        ]);

        assert_eq!(selected.len(), 2);
        assert_eq!(selected[0].session_id, "s1");
        assert_eq!(selected[1].session_id, "s2");
    }

    #[test]
    fn extracts_runtime_settings_and_spade_urls() {
        let html =
            r#"<script src="https://static.twitchcdn.net/config/settings.abc123.js"></script>"#;
        assert_eq!(
            extract_settings_url(html),
            Some("https://static.twitchcdn.net/config/settings.abc123.js".into())
        );

        let settings = r#"window.__settings={"spade_url":"https://spade.twitch.tv/track"};"#;
        assert_eq!(
            extract_spade_url(settings),
            Some("https://spade.twitch.tv/track".into())
        );
    }
}
