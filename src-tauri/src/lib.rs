// MSVC prints “.lib/.exp werden erstellt” to stdout while linking cdylibs; ignore that noise.
#![allow(linker_messages)]

mod auth;
mod channel_points;
mod channel_points_auth;
mod dock;
mod doctor;
mod eventsub;
mod helix;
mod http;
mod streaming;
mod twitch_web_auth;
mod viewer_presence;

use auth::{AuthSession, DeviceCodeResponse};
use doctor::DoctorReport;
use std::sync::Arc;
use streaming::{LaunchRequest, SharedStreaming, StreamSession, StreamingState};
use tauri::{AppHandle, Manager};

#[tauri::command]
async fn get_doctor_report() -> Result<DoctorReport, String> {
    // Probing `streamlink --version`, `mpv --version` and the registry can
    // take seconds (AV scans, cold Python start) — never run it on the
    // main thread (sync commands) or a runtime worker without offloading.
    tauri::async_runtime::spawn_blocking(doctor::run_doctor)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_twitch_client_id() -> Result<String, String> {
    auth::public_client_id().map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_get_session() -> Result<AuthSession, String> {
    auth::get_session().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_start_device_login() -> Result<DeviceCodeResponse, String> {
    auth::start_device_flow().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_poll_device_login(device_code: String) -> Result<auth::DevicePoll, String> {
    auth::poll_device_token(&device_code)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_logout(
    presence: tauri::State<'_, viewer_presence::SharedViewerPresence>,
) -> Result<(), String> {
    viewer_presence::cancel_all(presence.inner());
    auth::logout().await.map_err(|e| e.to_string())
}

#[tauri::command]
fn twitch_web_auth_status() -> Result<twitch_web_auth::TwitchWebAuthStatus, String> {
    twitch_web_auth::get_status().map_err(|e| e.to_string())
}

#[tauri::command]
async fn twitch_web_auth_save(
    token: String,
) -> Result<twitch_web_auth::TwitchWebAuthStatus, String> {
    twitch_web_auth::save(&token)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn twitch_web_auth_clear(
    presence: tauri::State<'_, viewer_presence::SharedViewerPresence>,
) -> Result<twitch_web_auth::TwitchWebAuthStatus, String> {
    viewer_presence::cancel_all(presence.inner());
    twitch_web_auth::clear().map_err(|e| e.to_string())
}

#[tauri::command]
fn channel_points_auth_status() -> Result<channel_points_auth::ChannelPointsAuthStatus, String> {
    channel_points_auth::get_status().map_err(|e| e.to_string())
}

#[tauri::command]
async fn channel_points_auth_start_device_login(
) -> Result<channel_points_auth::TvDeviceCodeResponse, String> {
    channel_points_auth::start_device_flow()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn channel_points_auth_poll_device_login(
    device_code: String,
) -> Result<channel_points_auth::TvDevicePoll, String> {
    channel_points_auth::poll_device_token(&device_code)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn channel_points_auth_clear(
    presence: tauri::State<'_, viewer_presence::SharedViewerPresence>,
) -> Result<channel_points_auth::ChannelPointsAuthStatus, String> {
    viewer_presence::cancel_all(presence.inner());
    channel_points_auth::clear().map_err(|e| e.to_string())
}

#[tauri::command]
async fn viewer_presence_sync(
    state: tauri::State<'_, viewer_presence::SharedViewerPresence>,
    enabled: bool,
    targets: Vec<viewer_presence::ViewerPresenceTarget>,
) -> Result<viewer_presence::ViewerPresenceStatus, String> {
    viewer_presence::sync(state.inner().clone(), enabled, targets)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn viewer_presence_status(
    state: tauri::State<'_, viewer_presence::SharedViewerPresence>,
) -> Result<viewer_presence::ViewerPresenceStatus, String> {
    viewer_presence::get_status(state.inner()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn channel_points_refresh(
    channel_login: String,
) -> Result<channel_points::ChannelPointsSnapshot, String> {
    channel_points::refresh(&channel_login)
        .await
        .map_err(|e| e.to_string())
}

/// Helix GET proxy: keeps the OAuth token inside Rust (never in the webview).
#[tauri::command]
async fn helix_fetch(
    path: String,
    query: Option<Vec<(String, String)>>,
) -> Result<serde_json::Value, String> {
    helix::fetch(&path, &query.unwrap_or_default())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn stream_start(
    app: AppHandle,
    state: tauri::State<'_, SharedStreaming>,
    request: LaunchRequest,
) -> Result<StreamSession, String> {
    // Path resolution + process spawn off the main thread.
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        streaming::start_stream(&app, &state, request).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
fn stream_list(state: tauri::State<'_, SharedStreaming>) -> Result<Vec<StreamSession>, String> {
    streaming::list_sessions(&state).map_err(|e| e.to_string())
}

#[tauri::command]
async fn stream_stop(state: tauri::State<'_, SharedStreaming>, id: String) -> Result<(), String> {
    // child.wait() blocks until Streamlink exits — offload it.
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        streaming::stop_stream(&state, &id).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn stream_stop_all(state: tauri::State<'_, SharedStreaming>) -> Result<(), String> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        streaming::stop_all(&state).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
fn stream_toggle_mute(
    state: tauri::State<'_, SharedStreaming>,
    id: String,
) -> Result<bool, String> {
    streaming::toggle_stream_mute(&state, &id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn open_chatterino_chat(channels: Vec<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        streaming::launch_chatterino_for_channels(&channels).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn close_owned_chatterino() -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(streaming::close_owned_chatterino)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn layout_watching(
    channels: Vec<String>,
    reserve_chat: bool,
    layout: Option<String>,
    linked_dock: Option<bool>,
    chat_fraction: Option<f64>,
    main_side: Option<String>,
) -> Result<(), String> {
    streaming::layout_watching(
        &channels,
        reserve_chat,
        layout.as_deref(),
        linked_dock,
        chat_fraction,
        main_side.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn dock_set_linked(enabled: bool) {
    streaming::dock_set_linked(enabled);
}

#[tauri::command]
fn dock_set_chat_fraction(fraction: f64) {
    streaming::dock_set_chat_fraction(fraction);
}

#[tauri::command]
fn dock_cycle_monitor() {
    streaming::dock_cycle_monitor();
}

#[tauri::command]
fn eventsub_sync(enabled: bool, channels: Vec<String>) -> Result<(), String> {
    eventsub::sync(enabled, channels);
    Ok(())
}

#[tauri::command]
fn app_quit(app: AppHandle) {
    app.exit(0);
}

fn init_sentry() -> Option<sentry::ClientInitGuard> {
    let dsn = std::env::var("SENTRY_DSN").ok().filter(|s| !s.is_empty())?;
    let mut opts = sentry::apply_defaults(sentry::ClientOptions::default());
    opts.dsn = Some(dsn.parse().ok()?);
    opts.release = Some(std::borrow::Cow::Borrowed(env!("CARGO_PKG_VERSION")));
    opts.send_default_pii = false;
    Some(sentry::init(opts))
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _sentry_guard = init_sentry();
    let streaming = Arc::new(StreamingState::new());
    let viewer_presence = Arc::new(viewer_presence::ViewerPresenceState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .manage(streaming)
        .manage(viewer_presence)
        .invoke_handler(tauri::generate_handler![
            get_doctor_report,
            get_twitch_client_id,
            auth_get_session,
            auth_start_device_login,
            auth_poll_device_login,
            auth_logout,
            twitch_web_auth_status,
            twitch_web_auth_save,
            twitch_web_auth_clear,
            channel_points_auth_status,
            channel_points_auth_start_device_login,
            channel_points_auth_poll_device_login,
            channel_points_auth_clear,
            viewer_presence_sync,
            viewer_presence_status,
            channel_points_refresh,
            helix_fetch,
            stream_start,
            stream_list,
            stream_stop,
            stream_stop_all,
            stream_toggle_mute,
            open_chatterino_chat,
            close_owned_chatterino,
            layout_watching,
            dock_set_linked,
            dock_set_chat_fraction,
            dock_cycle_monitor,
            eventsub_sync,
            app_quit
        ])
        .setup(|app| {
            streaming::init_dock(app.handle().clone());
            eventsub::init(app.handle().clone());
            let state = app.state::<SharedStreaming>().inner().clone();
            streaming::start_session_watchdog(app.handle().clone(), state);
            // Warm Streamlink so the first watch doesn't pay Python/plugin cold-start.
            std::thread::spawn(|| {
                if let Some(path) = doctor::find_streamlink_path() {
                    let _ = std::process::Command::new(path)
                        .arg("--version")
                        .stdin(std::process::Stdio::null())
                        .stdout(std::process::Stdio::null())
                        .stderr(std::process::Stdio::null())
                        .status();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
