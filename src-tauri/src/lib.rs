mod auth;
mod doctor;
mod streaming;

use auth::{AuthSession, DeviceCodeResponse};
use doctor::DoctorReport;
use streaming::{LaunchRequest, SharedStreaming, StreamSession, StreamingState};
use std::sync::Arc;

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
    state: tauri::State<'_, SharedStreaming>,
    request: LaunchRequest,
) -> Result<StreamSession, String> {
    streaming::start_stream(&state, request).map_err(|e| e.to_string())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let streaming = Arc::new(StreamingState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
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
            stream_stop_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
