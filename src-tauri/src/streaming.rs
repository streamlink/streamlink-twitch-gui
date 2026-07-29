use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use thiserror::Error;
use uuid::Uuid;

use crate::doctor::{run_doctor, ToolStatus};

#[derive(Debug, Error)]
pub enum StreamError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchRequest {
    pub channel: String,
    pub quality: Option<String>,
    pub title: Option<String>,
    pub game: Option<String>,
    pub streamlink_source: Option<String>,
    pub streamlink_custom_path: Option<String>,
    pub player_id: Option<String>,
    pub player_custom_path: Option<String>,
    pub player_custom_args: Option<String>,
    pub low_latency: Option<bool>,
    pub open_chat: Option<bool>,
    pub chat_provider: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamSession {
    pub id: String,
    pub channel: String,
    pub quality: String,
    pub title: Option<String>,
    pub game: Option<String>,
    pub running: bool,
}

struct LiveSession {
    info: StreamSession,
    child: Child,
}

pub struct StreamingState {
    inner: Mutex<HashMap<String, LiveSession>>,
}

impl StreamingState {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(HashMap::new()),
        }
    }
}

fn which_on_path(names: &[&str]) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        for name in names {
            let candidate = dir.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

fn bundled_streamlink() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let dir = exe.parent()?;
    let candidates = [
        dir.join("resources").join("streamlink").join("streamlinkw.exe"),
        dir.join("streamlink").join("streamlinkw.exe"),
        // Dev: relative to src-tauri/resources
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("resources")
            .join("streamlink")
            .join("streamlinkw.exe"),
    ];
    candidates.into_iter().find(|p| p.is_file())
}

fn resolve_streamlink(source: &str, custom: Option<&str>) -> Result<(PathBuf, String), StreamError> {
    match source {
        "custom" => {
            let path = custom
                .filter(|s| !s.is_empty())
                .map(PathBuf::from)
                .ok_or_else(|| StreamError::Message("custom Streamlink path is empty".into()))?;
            if !path.is_file() {
                return Err(StreamError::Message(format!(
                    "Streamlink not found at {}",
                    path.display()
                )));
            }
            Ok((path, "custom".into()))
        }
        "bundled" => {
            if let Some(path) = bundled_streamlink() {
                return Ok((path, "bundled".into()));
            }
            // Fall back to system if bundle missing in dev
            resolve_streamlink("system", None)
        }
        _ => {
            let doctor = run_doctor();
            if doctor.streamlink.found {
                if let Some(path) = doctor.streamlink.path {
                    return Ok((PathBuf::from(path), "system".into()));
                }
            }
            which_on_path(&["streamlinkw.exe", "streamlink.exe", "streamlink"])
                .map(|p| (p, "system".into()))
                .ok_or_else(|| StreamError::Message("Streamlink executable not found".into()))
        }
    }
}

fn resolve_player(player_id: &str, custom: Option<&str>) -> Result<Option<PathBuf>, StreamError> {
    match player_id {
        "custom" => {
            let path = custom
                .filter(|s| !s.is_empty())
                .map(PathBuf::from)
                .ok_or_else(|| StreamError::Message("custom player path is empty".into()))?;
            if !path.is_file() {
                return Err(StreamError::Message(format!(
                    "player not found at {}",
                    path.display()
                )));
            }
            Ok(Some(path))
        }
        "default" => Ok(None),
        id => {
            let names: &[&str] = match id {
                "mpv" => &["mpv.exe", "mpv"],
                "vlc" => &["vlc.exe", "vlc"],
                "mpc" => &["mpc-hc64.exe", "mpc-hc.exe", "mpc-be64.exe"],
                "potplayer" => &["PotPlayerMini64.exe", "PotPlayerMini.exe"],
                _ => &["mpv.exe", "mpv"],
            };
            if let Some(path) = which_on_path(names) {
                return Ok(Some(path));
            }
            let doctor = run_doctor();
            let status: &ToolStatus = match id {
                "mpv" => &doctor.mpv,
                _ => &doctor.mpv,
            };
            if let Some(path) = &status.path {
                return Ok(Some(PathBuf::from(path)));
            }
            Err(StreamError::Message(format!(
                "player '{id}' not found on PATH"
            )))
        }
    }
}

fn default_player_args(player_id: &str, channel: &str, title: &str, game: &str) -> String {
    match player_id {
        "mpv" => format!(
            "--force-window=yes --keep-open=no --title={channel} - {game} - {title} --force-media-title={channel} - {game} - {title}"
        ),
        "vlc" => format!("--play-and-exit --input-title-format {channel} - {game} - {title}"),
        _ => String::new(),
    }
}

fn launch_chatterino(channel: &str) -> Result<(), StreamError> {
    let doctor = run_doctor();
    let path = doctor
        .chatterino
        .path
        .map(PathBuf::from)
        .or_else(|| which_on_path(&["chatterino.exe", "chatterino"]))
        .ok_or_else(|| StreamError::Message("Chatterino not found".into()))?;
    Command::new(path)
        .arg("--channels")
        .arg(format!("t:{channel}"))
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()?;
    Ok(())
}

pub fn start_stream(
    state: &StreamingState,
    req: LaunchRequest,
) -> Result<StreamSession, StreamError> {
    let channel = req.channel.trim().trim_start_matches('#').to_lowercase();
    if channel.is_empty() {
        return Err(StreamError::Message("channel is empty".into()));
    }

    let quality = req
        .quality
        .filter(|q| !q.is_empty())
        .unwrap_or_else(|| "best".into());
    let source = req
        .streamlink_source
        .as_deref()
        .unwrap_or("bundled");
    let player_id = req.player_id.as_deref().unwrap_or("mpv");

    let (streamlink, _source_label) =
        resolve_streamlink(source, req.streamlink_custom_path.as_deref())?;
    let player = resolve_player(player_id, req.player_custom_path.as_deref())?;

    let title = req.title.clone().unwrap_or_else(|| channel.clone());
    let game = req.game.clone().unwrap_or_default();

    let mut args: Vec<String> = Vec::new();
    if req.low_latency.unwrap_or(true) {
        args.push("--twitch-low-latency".into());
    }
    if let Some(player_path) = &player {
        args.push("--player".into());
        args.push(player_path.to_string_lossy().to_string());
        let player_args = req
            .player_custom_args
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| default_player_args(player_id, &channel, &title, &game));
        if !player_args.is_empty() {
            args.push("--player-args".into());
            args.push(player_args);
        }
    }
    args.push(format!("twitch.tv/{channel}"));
    args.push(quality.clone());

    let mut child = Command::new(&streamlink)
        .args(&args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    // Best-effort: detach reading so buffers don't fill; ignore output for now
    let _ = child.stdout.take();
    let _ = child.stderr.take();

    if req.open_chat.unwrap_or(true) {
        match req.chat_provider.as_deref().unwrap_or("embedded") {
            "chatterino" => {
                let _ = launch_chatterino(&channel);
            }
            _ => {}
        }
    }

    let id = Uuid::new_v4().to_string();
    let info = StreamSession {
        id: id.clone(),
        channel: channel.clone(),
        quality,
        title: req.title,
        game: req.game,
        running: true,
    };

    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    map.insert(
        id,
        LiveSession {
            info: info.clone(),
            child,
        },
    );
    Ok(info)
}

pub fn list_sessions(state: &StreamingState) -> Result<Vec<StreamSession>, StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    let mut remove = Vec::new();
    for (id, session) in map.iter_mut() {
        match session.child.try_wait() {
            Ok(Some(_)) => {
                session.info.running = false;
                remove.push(id.clone());
            }
            Ok(None) => {}
            Err(_) => {
                session.info.running = false;
                remove.push(id.clone());
            }
        }
    }
    for id in &remove {
        map.remove(id);
    }
    Ok(map.values().map(|s| s.info.clone()).collect())
}

pub fn stop_stream(state: &StreamingState, id: &str) -> Result<(), StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    if let Some(mut session) = map.remove(id) {
        let _ = session.child.kill();
        let _ = session.child.wait();
    }
    Ok(())
}

pub fn stop_all(state: &StreamingState) -> Result<(), StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    for (_, mut session) in map.drain() {
        let _ = session.child.kill();
        let _ = session.child.wait();
    }
    Ok(())
}

#[allow(dead_code)]
pub fn streamlink_path_exists(path: &Path) -> bool {
    path.is_file()
}

pub type SharedStreaming = Arc<StreamingState>;
