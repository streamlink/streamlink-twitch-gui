mod auth;
mod doctor;

use auth::{AuthSession, DeviceCodeResponse};
use doctor::DoctorReport;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_doctor_report,
            get_twitch_client_id,
            auth_get_session,
            auth_start_device_login,
            auth_poll_device_login,
            auth_logout,
            auth_get_access_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
