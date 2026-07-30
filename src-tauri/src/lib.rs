// MSVC prints “.lib/.exp werden erstellt” to stdout while linking cdylibs; ignore that noise.
#![allow(linker_messages)]

mod auth;
mod doctor;
mod streaming;

use auth::{AuthSession, DeviceCodeResponse};
use doctor::DoctorReport;
use streaming::{LaunchRequest, SharedStreaming, StreamSession, StreamingState};
use std::sync::Arc;
use tauri::{AppHandle, Manager};

#[tauri::command]
fn get_doctor_report() -> DoctorReport {
    doctor::run_doctor()
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
async fn auth_poll_device_login(device_code: String) -> Result<Option<AuthSession>, String> {
    auth::poll_device_token(&device_code)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_logout() -> Result<(), String> {
    auth::logout().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn auth_get_access_token() -> Result<String, String> {
    auth::access_token().await.map_err(|e| e.to_string())
}

#[tauri::command]
fn stream_start(
    app: AppHandle,
    state: tauri::State<'_, SharedStreaming>,
    request: LaunchRequest,
) -> Result<StreamSession, String> {
    streaming::start_stream(&app, &state, request).map_err(|e| e.to_string())
}

#[tauri::command]
fn stream_list(state: tauri::State<'_, SharedStreaming>) -> Result<Vec<StreamSession>, String> {
    streaming::list_sessions(&state).map_err(|e| e.to_string())
}

#[tauri::command]
fn stream_stop(state: tauri::State<'_, SharedStreaming>, id: String) -> Result<(), String> {
    streaming::stop_stream(&state, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn stream_stop_all(state: tauri::State<'_, SharedStreaming>) -> Result<(), String> {
    streaming::stop_all(&state).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_chatterino_chat(channels: Vec<String>) -> Result<String, String> {
    streaming::launch_chatterino_for_channels(&channels).map_err(|e| e.to_string())
}

#[tauri::command]
fn close_owned_chatterino() -> Result<(), String> {
    streaming::close_owned_chatterino();
    Ok(())
}

#[tauri::command]
fn layout_watching(
    channels: Vec<String>,
    reserve_chat: bool,
    layout: Option<String>,
) -> Result<(), String> {
    streaming::layout_watching(&channels, reserve_chat, layout.as_deref())
        .map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![
            get_doctor_report,
            get_twitch_client_id,
            auth_get_session,
            auth_start_device_login,
            auth_poll_device_login,
            auth_logout,
            auth_get_access_token,
            stream_start,
            stream_list,
            stream_stop,
            stream_stop_all,
            open_chatterino_chat,
            close_owned_chatterino,
            layout_watching,
            app_quit
        ])
        .setup(|app| {
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
