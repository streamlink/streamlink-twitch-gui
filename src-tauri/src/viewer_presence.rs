use reqwest::header::{ACCEPT, AUTHORIZATION, RANGE, REFERER, USER_AGENT};
use reqwest::{Response, StatusCode};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use thiserror::Error;
use url::Url;
use uuid::Uuid;

use crate::http::shared_client;

const TWITCH_URL: &str = "https://www.twitch.tv";
const GQL_URL: &str = "https://gql.twitch.tv/gql";
const USHER_URL: &str = "https://usher.ttvnw.net/api/v2/channel/hls/";
const BROWSER_CLIENT_ID: &str = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const PLAYBACK_ACCESS_TOKEN_HASH: &str =
    "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9";
const FALLBACK_CLIENT_VERSION: &str = "ef928475-9403-42f2-8a34-55784bd08e16";
const USER_AGENT_VALUE: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const SUCCESS_INTERVAL: Duration = Duration::from_secs(60);
const MAX_WORKERS: usize = 2;

#[derive(Debug, Error)]
pub enum ViewerPresenceError {
    #[error("{0}")]
    Message(String),
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
pub struct ViewerPresenceWorkerStatus {
    pub session_id: String,
    pub channel_login: String,
    pub last_stage: String,
    pub last_http_status: Option<u16>,
    pub last_error: Option<String>,
    pub last_success_unix_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewerPresenceStatus {
    pub enabled: bool,
    pub active_session_ids: Vec<String>,
    pub limited: bool,
    pub workers: Vec<ViewerPresenceWorkerStatus>,
}

struct Worker {
    target: ViewerPresenceTarget,
    token: String,
    cancel: Arc<AtomicBool>,
}

pub struct ViewerPresenceState {
    workers: Mutex<HashMap<String, Worker>>,
    diagnostics: Mutex<HashMap<String, ViewerPresenceWorkerStatus>>,
    sync_gate: tokio::sync::Mutex<()>,
    generation: AtomicU64,
    enabled: AtomicBool,
    limited: AtomicBool,
    device_id: String,
    client_session: String,
}

pub type SharedViewerPresence = Arc<ViewerPresenceState>;

impl ViewerPresenceState {
    pub fn new() -> Self {
        Self {
            workers: Mutex::new(HashMap::new()),
            diagnostics: Mutex::new(HashMap::new()),
            sync_gate: tokio::sync::Mutex::new(()),
            generation: AtomicU64::new(0),
            enabled: AtomicBool::new(false),
            limited: AtomicBool::new(false),
            device_id: Uuid::new_v4().simple().to_string(),
            client_session: Uuid::new_v4().simple().to_string(),
        }
    }
}

#[derive(Debug, Clone)]
struct RuntimeConfig {
    spade_url: Url,
    client_version: String,
}

#[derive(Debug)]
struct ProtocolError {
    stage: &'static str,
    status: Option<u16>,
    message: String,
}

impl ProtocolError {
    fn new(stage: &'static str, message: impl Into<String>) -> Self {
        Self {
            stage,
            status: None,
            message: message.into(),
        }
    }

    fn with_status(stage: &'static str, status: StatusCode, message: impl Into<String>) -> Self {
        Self {
            stage,
            status: Some(status.as_u16()),
            message: message.into(),
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

fn cancel_workers(state: &ViewerPresenceState, clear_diagnostics: bool) {
    state.generation.fetch_add(1, Ordering::AcqRel);
    if let Ok(mut workers) = state.workers.lock() {
        for worker in workers.values() {
            worker.cancel.store(true, Ordering::Release);
        }
        workers.clear();
    }
    if clear_diagnostics {
        if let Ok(mut diagnostics) = state.diagnostics.lock() {
            diagnostics.clear();
        }
    }
}

pub fn cancel_all(state: &ViewerPresenceState) {
    state.enabled.store(false, Ordering::Release);
    state.limited.store(false, Ordering::Release);
    cancel_workers(state, true);
}

pub fn get_status(
    state: &ViewerPresenceState,
) -> Result<ViewerPresenceStatus, ViewerPresenceError> {
    let workers = state
        .workers
        .lock()
        .map_err(|_| ViewerPresenceError::Message("viewer presence state poisoned".into()))?;
    let mut active_session_ids = workers.keys().cloned().collect::<Vec<_>>();
    active_session_ids.sort();
    drop(workers);

    let diagnostics = state
        .diagnostics
        .lock()
        .map_err(|_| ViewerPresenceError::Message("viewer presence diagnostics poisoned".into()))?;
    let mut worker_statuses = diagnostics.values().cloned().collect::<Vec<_>>();
    worker_statuses.sort_by(|left, right| left.session_id.cmp(&right.session_id));

    Ok(ViewerPresenceStatus {
        enabled: state.enabled.load(Ordering::Acquire),
        active_session_ids,
        limited: state.limited.load(Ordering::Acquire),
        workers: worker_statuses,
    })
}

pub async fn sync(
    state: SharedViewerPresence,
    enabled: bool,
    targets: Vec<ViewerPresenceTarget>,
) -> Result<ViewerPresenceStatus, ViewerPresenceError> {
    let _sync_guard = state.sync_gate.lock().await;
    state.enabled.store(enabled, Ordering::Release);

    if !enabled {
        state.limited.store(false, Ordering::Release);
        cancel_workers(&state, true);
        return get_status(&state);
    }

    let original_count = targets.len();
    let selected = select_targets(targets);
    let limited = original_count > selected.len() && selected.len() == MAX_WORKERS;
    state.limited.store(limited, Ordering::Release);

    if selected.is_empty() {
        cancel_workers(&state, true);
        state.enabled.store(true, Ordering::Release);
        return get_status(&state);
    }

    let token = crate::twitch_web_auth::load_token()
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
        cancel_workers(&state, true);
        state.enabled.store(true, Ordering::Release);
        return Err(ViewerPresenceError::Message(
            "authenticated playback does not match the current Twitch account".into(),
        ));
    }

    let generation = state.generation.load(Ordering::Acquire);
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
        let mut removed = Vec::new();
        workers.retain(|session_id, worker| {
            let keep = desired.get(session_id) == Some(&worker.target) && worker.token == token;
            if !keep {
                worker.cancel.store(true, Ordering::Release);
                removed.push(session_id.clone());
            }
            keep
        });

        if let Ok(mut diagnostics) = state.diagnostics.lock() {
            for session_id in removed {
                diagnostics.remove(&session_id);
            }
        }

        for target in selected {
            if workers.contains_key(&target.session_id) {
                continue;
            }
            let cancel = Arc::new(AtomicBool::new(false));
            workers.insert(
                target.session_id.clone(),
                Worker {
                    target: target.clone(),
                    token: token.clone(),
                    cancel: cancel.clone(),
                },
            );
            set_diagnostic(&state, &target, "starting", None, None, None);
            spawn.push((target, cancel));
        }
    }

    for (target, cancel) in spawn {
        let worker_state = state.clone();
        let worker_viewer_id = viewer_id.clone();
        let worker_token = token.clone();
        tauri::async_runtime::spawn(async move {
            run_worker(
                worker_state,
                target,
                worker_viewer_id,
                worker_token,
                generation,
                cancel,
            )
            .await;
        });
    }

    get_status(&state)
}

fn set_diagnostic(
    state: &ViewerPresenceState,
    target: &ViewerPresenceTarget,
    stage: &str,
    status: Option<u16>,
    error: Option<String>,
    success_unix_ms: Option<u64>,
) {
    if let Ok(mut diagnostics) = state.diagnostics.lock() {
        let previous_success = diagnostics
            .get(&target.session_id)
            .and_then(|current| current.last_success_unix_ms);
        diagnostics.insert(
            target.session_id.clone(),
            ViewerPresenceWorkerStatus {
                session_id: target.session_id.clone(),
                channel_login: target.channel_login.clone(),
                last_stage: stage.to_string(),
                last_http_status: status,
                last_error: error,
                last_success_unix_ms: success_unix_ms.or(previous_success),
            },
        );
    }
}

async fn run_worker(
    state: SharedViewerPresence,
    target: ViewerPresenceTarget,
    viewer_id: String,
    token: String,
    generation: u64,
    cancel: Arc<AtomicBool>,
) {
    let mut runtime: Option<RuntimeConfig> = None;
    let mut failures = 0u32;

    loop {
        if cancel.load(Ordering::Acquire)
            || state.generation.load(Ordering::Acquire) != generation
            || !website_auth_still_matches(&viewer_id, &token)
        {
            break;
        }

        let cycle = run_watch_cycle(&state, &target, &viewer_id, &token, &mut runtime).await;

        let delay = match cycle {
            Ok(status) => {
                failures = 0;
                set_diagnostic(
                    &state,
                    &target,
                    "telemetry-accepted",
                    Some(status.as_u16()),
                    None,
                    Some(unix_time_ms()),
                );
                SUCCESS_INTERVAL
            }
            Err(error) => {
                failures = failures.saturating_add(1);
                if matches!(error.stage, "runtime-config" | "playback-token") {
                    runtime = None;
                }
                set_diagnostic(
                    &state,
                    &target,
                    error.stage,
                    error.status,
                    Some(error.message),
                    None,
                );
                failure_delay(failures)
            }
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

async fn run_watch_cycle(
    state: &ViewerPresenceState,
    target: &ViewerPresenceTarget,
    viewer_id: &str,
    token: &str,
    runtime: &mut Option<RuntimeConfig>,
) -> Result<StatusCode, ProtocolError> {
    if runtime.is_none() {
        set_diagnostic(state, target, "runtime-config", None, None, None);
        *runtime = Some(resolve_runtime(&target.channel_login).await?);
    }
    let runtime = runtime
        .as_ref()
        .ok_or_else(|| ProtocolError::new("runtime-config", "runtime configuration unavailable"))?;

    set_diagnostic(state, target, "playback-token", None, None, None);
    let playback = fetch_playback_access_token(
        &target.channel_login,
        token,
        &state.device_id,
        &state.client_session,
        &runtime.client_version,
    )
    .await?;

    set_diagnostic(state, target, "master-playlist", None, None, None);
    let master_url = build_usher_url(&target.channel_login, &playback.signature, &playback.value)?;
    let (master, master_status) = fetch_text(&master_url, "master-playlist").await?;
    set_diagnostic(
        state,
        target,
        "master-playlist",
        Some(master_status.as_u16()),
        None,
        None,
    );

    let media_url = select_media_playlist_url(&master, &master_url)?;

    set_diagnostic(state, target, "media-playlist", None, None, None);
    let (media, media_status) = fetch_text(&media_url, "media-playlist").await?;
    set_diagnostic(
        state,
        target,
        "media-playlist",
        Some(media_status.as_u16()),
        None,
        None,
    );
    let segment_url = select_media_segment_url(&media, &media_url)?;

    set_diagnostic(state, target, "media-segment", None, None, None);
    let segment_status = touch_media_segment(&segment_url).await?;
    set_diagnostic(
        state,
        target,
        "media-segment",
        Some(segment_status.as_u16()),
        None,
        None,
    );

    set_diagnostic(state, target, "telemetry", None, None, None);
    send_minute_watched(&runtime.spade_url, target, viewer_id).await
}

fn website_auth_still_matches(viewer_id: &str, expected_token: &str) -> bool {
    let current_token = crate::twitch_web_auth::load_token().ok().flatten();
    if current_token.as_deref() != Some(expected_token) {
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

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .try_into()
        .unwrap_or(u64::MAX)
}

async fn resolve_runtime(channel_login: &str) -> Result<RuntimeConfig, ProtocolError> {
    let page_url = format!("{TWITCH_URL}/{channel_login}");
    let page_url = Url::parse(&page_url)
        .map_err(|_| ProtocolError::new("runtime-config", "invalid Twitch channel URL"))?;
    let (page, _) = fetch_text(&page_url, "runtime-config").await?;
    let client_version =
        extract_client_version(&page).unwrap_or_else(|| FALLBACK_CLIENT_VERSION.to_string());

    let settings_url = extract_settings_url(&page).ok_or_else(|| {
        ProtocolError::new("runtime-config", "Twitch runtime settings URL was not found")
    })?;
    let settings_url = validate_https_url(&settings_url, "runtime-config")?;
    let (settings, _) = fetch_text(&settings_url, "runtime-config").await?;
    let spade_url = extract_spade_url(&settings)
        .ok_or_else(|| ProtocolError::new("runtime-config", "Twitch Spade endpoint was not found"))?;
    let spade_url = validate_https_url(&spade_url, "runtime-config")?;

    Ok(RuntimeConfig {
        spade_url,
        client_version,
    })
}

#[derive(Debug, Deserialize)]
struct PlaybackTokenResponse {
    data: Option<PlaybackTokenData>,
    errors: Option<Vec<GraphQlError>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PlaybackTokenData {
    stream_playback_access_token: Option<PlaybackAccessToken>,
}

#[derive(Debug, Deserialize)]
struct PlaybackAccessToken {
    signature: String,
    value: String,
}

#[derive(Debug, Deserialize)]
struct GraphQlError {
    message: Option<String>,
}

async fn fetch_playback_access_token(
    channel_login: &str,
    token: &str,
    device_id: &str,
    client_session: &str,
    client_version: &str,
) -> Result<PlaybackAccessToken, ProtocolError> {
    let payload = build_playback_access_token_payload(channel_login);
    let response = shared_client()
        .post(GQL_URL)
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(ACCEPT, "application/json")
        .header(AUTHORIZATION, format!("OAuth {token}"))
        .header("Client-Id", BROWSER_CLIENT_ID)
        .header("Client-Session-Id", client_session)
        .header("Client-Version", client_version)
        .header("X-Device-Id", device_id)
        .header(REFERER, format!("{TWITCH_URL}/{channel_login}"))
        .json(&payload)
        .send()
        .await
        .map_err(|_| ProtocolError::new("playback-token", "Twitch GraphQL request failed"))?;
    let status = response.status();
    if !status.is_success() {
        return Err(ProtocolError::with_status(
            "playback-token",
            status,
            "Twitch rejected the playback-token request",
        ));
    }

    let body = response
        .json::<PlaybackTokenResponse>()
        .await
        .map_err(|_| {
            ProtocolError::with_status(
                "playback-token",
                status,
                "Twitch returned an invalid playback-token response",
            )
        })?;
    if let Some(token) = body
        .data
        .and_then(|data| data.stream_playback_access_token)
        .filter(|value| !value.signature.is_empty() && !value.value.is_empty())
    {
        return Ok(token);
    }

    let message = body
        .errors
        .unwrap_or_default()
        .into_iter()
        .filter_map(|error| error.message)
        .next()
        .map(|message| truncate_message(&message))
        .unwrap_or_else(|| "Twitch returned no playback access token".to_string());
    Err(ProtocolError::with_status(
        "playback-token",
        status,
        message,
    ))
}

pub(crate) fn build_playback_access_token_payload(channel_login: &str) -> serde_json::Value {
    serde_json::json!({
        "operationName": "PlaybackAccessToken",
        "variables": {
            "login": channel_login,
            "isLive": true,
            "isVod": false,
            "vodID": "",
            "playerType": "site",
            "platform": "web"
        },
        "extensions": {
            "persistedQuery": {
                "version": 1,
                "sha256Hash": PLAYBACK_ACCESS_TOKEN_HASH
            }
        }
    })
}

fn build_usher_url(
    channel_login: &str,
    signature: &str,
    token: &str,
) -> Result<Url, ProtocolError> {
    let mut url = Url::parse(&format!("{USHER_URL}{channel_login}.m3u8"))
        .map_err(|_| ProtocolError::new("master-playlist", "invalid Twitch playlist URL"))?;
    let random_parameter = unix_time_ms() % 999_999;
    url.query_pairs_mut()
        .append_pair("sig", signature)
        .append_pair("token", token)
        .append_pair("platform", "web")
        .append_pair("p", &random_parameter.to_string())
        .append_pair("allow_source", "true")
        .append_pair("allow_audio_only", "true")
        .append_pair("playlist_include_framerate", "true")
        .append_pair("supported_codecs", "h264");
    Ok(url)
}

async fn fetch_text(url: &Url, stage: &'static str) -> Result<(String, StatusCode), ProtocolError> {
    let response = shared_client()
        .get(url.clone())
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(REFERER, TWITCH_URL)
        .send()
        .await
        .map_err(|_| ProtocolError::new(stage, "Twitch request failed"))?;
    response_text(response, stage).await
}

async fn response_text(
    response: Response,
    stage: &'static str,
) -> Result<(String, StatusCode), ProtocolError> {
    let status = response.status();
    if !status.is_success() {
        return Err(ProtocolError::with_status(
            stage,
            status,
            "Twitch returned an unsuccessful response",
        ));
    }
    let text = response.text().await.map_err(|_| {
        ProtocolError::with_status(stage, status, "Twitch response could not be read")
    })?;
    Ok((text, status))
}

fn select_media_playlist_url(master: &str, master_url: &Url) -> Result<Url, ProtocolError> {
    let mut best: Option<(u64, Url)> = None;
    let mut pending_bandwidth: Option<u64> = None;

    for line in master.lines().map(str::trim) {
        if let Some(rest) = line.strip_prefix("#EXT-X-STREAM-INF:") {
            pending_bandwidth = rest
                .split(',')
                .find_map(|part| part.trim().strip_prefix("BANDWIDTH="))
                .and_then(|value| value.parse::<u64>().ok());
            continue;
        }

        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Ok(url) = master_url.join(line.trim_matches('"')) {
            if url.scheme() == "https" {
                let bandwidth = pending_bandwidth.unwrap_or(u64::MAX);
                if best.as_ref().map(|(best_bw, _)| bandwidth < *best_bw).unwrap_or(true) {
                    best = Some((bandwidth, url));
                }
            }
        }

        pending_bandwidth = None;
    }

    if let Some((_, url)) = best {
        return Ok(url);
    }
    if master.contains("#EXT-X-TARGETDURATION") || master.contains("#EXTINF") {
        return Ok(master_url.clone());
    }
    Err(ProtocolError::new(
        "master-playlist",
        "Twitch master playlist contained no playable rendition",
    ))
}

fn select_media_segment_url(media: &str, media_url: &Url) -> Result<Url, ProtocolError> {
    let mut urls = playlist_urls(media, media_url);
    for line in media.lines().map(str::trim) {
        if let Some(value) = line.strip_prefix("#EXT-X-TWITCH-PREFETCH:") {
            if let Ok(url) = media_url.join(value.trim().trim_matches('"')) {
                urls.push(url);
            }
        }
    }
    urls.pop().ok_or_else(|| {
        ProtocolError::new(
            "media-playlist",
            "Twitch media playlist contained no segment",
        )
    })
}

pub(crate) fn playlist_urls(playlist: &str, base_url: &Url) -> Vec<Url> {
    playlist
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .filter_map(|line| base_url.join(line.trim_matches('"')).ok())
        .filter(|url| url.scheme() == "https")
        .collect()
}

async fn touch_media_segment(url: &Url) -> Result<StatusCode, ProtocolError> {
    let response = shared_client()
        .head(url.clone())
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(REFERER, TWITCH_URL)
        .send()
        .await
        .map_err(|_| ProtocolError::new("media-segment", "Twitch media-segment request failed"))?;
    let status = response.status();
    if status.is_success() || status.is_redirection() {
        return Ok(status);
    }

    if status == StatusCode::METHOD_NOT_ALLOWED {
        let fallback = shared_client()
            .get(url.clone())
            .header(USER_AGENT, USER_AGENT_VALUE)
            .header(REFERER, TWITCH_URL)
            .header(RANGE, "bytes=0-0")
            .send()
            .await
            .map_err(|_| {
                ProtocolError::new("media-segment", "Twitch media-segment fallback failed")
            })?;
        let fallback_status = fallback.status();
        if fallback_status.is_success() || fallback_status == StatusCode::PARTIAL_CONTENT {
            return Ok(fallback_status);
        }
        return Err(ProtocolError::with_status(
            "media-segment",
            fallback_status,
            "Twitch rejected the media-segment fallback",
        ));
    }

    Err(ProtocolError::with_status(
        "media-segment",
        status,
        "Twitch rejected the media-segment request",
    ))
}

fn validate_https_url(raw: &str, stage: &'static str) -> Result<Url, ProtocolError> {
    let parsed =
        Url::parse(raw).map_err(|_| ProtocolError::new(stage, "invalid Twitch runtime URL"))?;
    if parsed.scheme() != "https" || parsed.host_str().is_none() {
        return Err(ProtocolError::new(
            stage,
            "Twitch runtime URL must use HTTPS",
        ));
    }
    Ok(parsed)
}

pub(crate) fn extract_client_version(html: &str) -> Option<String> {
    let marker = "window.__twilightBuildID";
    let tail = &html[html.find(marker)? + marker.len()..];
    let tail = &tail[tail.find('=')? + 1..];
    let quote_index = tail.find(|character| character == '"' || character == '\'')?;
    let quote = tail.as_bytes().get(quote_index).copied()? as char;
    let value_tail = &tail[quote_index + 1..];
    let end = value_tail.find(quote)?;
    let value = &value_tail[..end];
    if value.len() == 36
        && value.chars().enumerate().all(|(index, character)| {
            if matches!(index, 8 | 13 | 18 | 23) {
                character == '-'
            } else {
                character.is_ascii_hexdigit()
            }
        })
    {
        Some(value.to_string())
    } else {
        None
    }
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
    endpoint: &Url,
    target: &ViewerPresenceTarget,
    viewer_id: &str,
) -> Result<StatusCode, ProtocolError> {
    let payload = build_minute_watched_payload(target, viewer_id);
    let encoded = base64_encode(payload.as_bytes());
    let response = shared_client()
        .post(endpoint.clone())
        .header(USER_AGENT, USER_AGENT_VALUE)
        .header(REFERER, TWITCH_URL)
        .form(&[("data", encoded.as_str())])
        .send()
        .await
        .map_err(|_| ProtocolError::new("telemetry", "Twitch telemetry request failed"))?;
    let status = response.status();
    if status == StatusCode::NO_CONTENT {
        Ok(status)
    } else {
        Err(ProtocolError::with_status(
            "telemetry",
            status,
            "Twitch did not accept the watch telemetry",
        ))
    }
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
    const ALPHABET: &[u8; 64] =
        b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut output = String::with_capacity(input.len().div_ceil(3) * 4);
    let mut index = 0;
    while index < input.len() {
        let first = input[index];
        let second = input.get(index + 1).copied();
        let third = input.get(index + 2).copied();

        output.push(ALPHABET[(first >> 2) as usize] as char);
        output.push(
            ALPHABET[(((first & 0b0000_0011) << 4) | second.unwrap_or(0) >> 4) as usize]
                as char,
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

fn truncate_message(message: &str) -> String {
    message.chars().take(240).collect()
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
        assert_eq!(properties["player"], "site");
        assert_eq!(properties["user_id"], "9001");
        assert_eq!(properties["live"], true);
        assert_eq!(properties["channel"], "example_channel");
    }

    #[test]
    fn playback_payload_matches_current_web_player_contract() {
        let payload = build_playback_access_token_payload("example");
        assert_eq!(payload["operationName"], "PlaybackAccessToken");
        assert_eq!(payload["variables"]["login"], "example");
        assert_eq!(payload["variables"]["isLive"], true);
        assert_eq!(payload["variables"]["isVod"], false);
        assert_eq!(payload["variables"]["playerType"], "site");
        assert_eq!(payload["variables"]["platform"], "web");
        assert_eq!(
            payload["extensions"]["persistedQuery"]["sha256Hash"],
            PLAYBACK_ACCESS_TOKEN_HASH
        );
    }

    #[test]
    fn extracts_dynamic_twitch_client_version() {
        let html =
            r#"<script>window.__twilightBuildID = "12345678-1234-abcd-9876-0123456789ab";</script>"#;
        assert_eq!(
            extract_client_version(html).as_deref(),
            Some("12345678-1234-abcd-9876-0123456789ab")
        );
        assert_eq!(
            extract_client_version("window.__twilightBuildID = \"bad\";"),
            None
        );
    }

    #[test]
    fn parses_master_and_media_playlists_with_relative_urls() {
        let master_url =
            Url::parse("https://usher.ttvnw.net/api/v2/channel/hls/example.m3u8").unwrap();
        let master = concat!(
            "#EXTM3U\r\n",
            "#EXT-X-STREAM-INF:BANDWIDTH=3000000\r\n",
            "https://video-edge.example.net/high/index.m3u8\r\n",
            "#EXT-X-STREAM-INF:BANDWIDTH=160000\r\n",
            "low/index.m3u8\r\n",
        );
        let media_url = select_media_playlist_url(master, &master_url).unwrap();
        assert_eq!(
            media_url.as_str(),
            "https://usher.ttvnw.net/api/v2/channel/hls/low/index.m3u8"
        );

        let media = concat!(
            "#EXTM3U\r\n",
            "#EXT-X-TARGETDURATION:2\r\n",
            "#EXTINF:2.0,\r\n",
            "segment-10.ts\r\n",
            "#EXTINF:2.0,\r\n",
            "segment-11.ts\r\n",
        );
        let segment_url = select_media_segment_url(media, &media_url).unwrap();
        assert_eq!(
            segment_url.as_str(),
            "https://usher.ttvnw.net/api/v2/channel/hls/low/segment-11.ts"
        );
    }

    #[test]
    fn sanitizes_deduplicates_and_caps_targets() {
        let selected = select_targets(vec![
            target(" one ", "Example"),
            target("one", "ignored"),
            target("two", "Second_Channel"),
            target("three", "third"),
        ]);

        assert_eq!(selected.len(), 2);
        assert_eq!(selected[0].session_id, "one");
        assert_eq!(selected[0].channel_login, "example");
        assert_eq!(selected[1].session_id, "two");
        assert_eq!(selected[1].channel_login, "second_channel");
    }

    #[test]
    fn rejects_invalid_target_identifiers() {
        let mut invalid_channel_id = target("one", "example");
        invalid_channel_id.channel_id = "not-a-number".into();
        let mut invalid_login = target("two", "bad-login");
        invalid_login.channel_id = "2".into();

        assert!(select_targets(vec![invalid_channel_id, invalid_login]).is_empty());
    }

    #[test]
    fn extracts_runtime_urls() {
        let html =
            r#"<script src="https://static.twitchcdn.net/config/settings.abc123.js"></script>"#;
        assert_eq!(
            extract_settings_url(html).as_deref(),
            Some("https://static.twitchcdn.net/config/settings.abc123.js")
        );

        let settings =
            r#"window.__settings={"spade_url":"https:\/\/spade.twitch.tv\/track"};"#;
        assert_eq!(
            extract_spade_url(settings).as_deref(),
            Some("https://spade.twitch.tv/track")
        );
    }
}
