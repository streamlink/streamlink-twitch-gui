use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex, OnceLock};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use thiserror::Error;
use uuid::Uuid;

#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;

use crate::doctor::{find_chatterino_path, find_mpv_path, find_streamlink_path, which_on_path};

/// Cached tool paths so every `stream_start` does not re-walk PATH/fallbacks.
type StreamlinkCacheEntry = (String, Option<String>, PathBuf);
static STREAMLINK_PATH_CACHE: OnceLock<Mutex<Option<StreamlinkCacheEntry>>> = OnceLock::new();
static MPV_PATH_CACHE: OnceLock<Mutex<Option<PathBuf>>> = OnceLock::new();
static CHATTERINO_PATH_CACHE: OnceLock<Mutex<Option<PathBuf>>> = OnceLock::new();

/// How long the player window must be continuously missing (window-title
/// heuristic) before a session is treated as closed and Streamlink is killed.
/// The watchdog ticks every 1.5 s, so 40 s ≈ 26 consecutive misses.
const MPV_MISSING_GRACE: Duration = Duration::from_secs(40);

fn streamlink_cache() -> &'static Mutex<Option<StreamlinkCacheEntry>> {
    STREAMLINK_PATH_CACHE.get_or_init(|| Mutex::new(None))
}
fn mpv_cache() -> &'static Mutex<Option<PathBuf>> {
    MPV_PATH_CACHE.get_or_init(|| Mutex::new(None))
}
fn chatterino_cache() -> &'static Mutex<Option<PathBuf>> {
    CHATTERINO_PATH_CACHE.get_or_init(|| Mutex::new(None))
}

/// PID of the Chatterino process we spawned (never resize unrelated user windows).
fn owned_chatterino_pid() -> &'static Mutex<Option<u32>> {
    static PID: OnceLock<Mutex<Option<u32>>> = OnceLock::new();
    PID.get_or_init(|| Mutex::new(None))
}

fn cached_chatterino_path() -> Option<PathBuf> {
    if let Ok(guard) = chatterino_cache().lock() {
        if let Some(path) = guard.as_ref() {
            if path.is_file() {
                return Some(path.clone());
            }
        }
    }
    let found = find_chatterino_path()?;
    if let Ok(mut guard) = chatterino_cache().lock() {
        *guard = Some(found.clone());
    }
    Some(found)
}

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
    pub disable_ads: Option<bool>,
    pub player_input: Option<String>,
    pub webbrowser: Option<bool>,
    pub webbrowser_headless: Option<bool>,
    pub webbrowser_executable: Option<String>,
    pub retry_streams: Option<u32>,
    pub retry_max: Option<u32>,
    pub player_no_close: Option<bool>,
    /// Leave a right strip for Chatterino; Rust sets absolute mpv --geometry.
    pub reserve_chat: Option<bool>,
    /// When true, keep existing sessions until this one is ready, then stop them.
    pub replace_existing: Option<bool>,
    /// Planned tile of this stream in the dock grid (frontend slot order) —
    /// lets the launch geometry open the window already snapped to its tile.
    pub slot_index: Option<u32>,
    pub slot_count: Option<u32>,
    /// Multistream preset from settings (e.g. "2x2") for the launch geometry.
    pub layout: Option<String>,
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
    pub status: String,
    pub phase: String,
    pub ready: bool,
    /// Soft mute via mpv IPC (fast-start sessions).
    pub muted: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamStatusPayload {
    pub id: String,
    pub channel: String,
    pub line: String,
    pub status: String,
    pub phase: String,
    pub ready: bool,
}

struct LiveSession {
    info: StreamSession,
    child: Child,
    /// Windows Job containing the Streamlink child (and transitively the
    /// player). Terminating it kills the whole tree.
    job: JobSlot,
    /// Pre-launched mpv owned by this session (fast start, Windows only).
    player: Option<FastPlayer>,
    /// When the player became ready — grace before treating missing mpv as closed.
    ready_at: Option<Instant>,
    /// First moment the player window was observed missing (None = seen alive).
    /// The window-title lookup is only a heuristic, so a session is treated as
    /// closed solely on missing titles after a long, continuous absence.
    mpv_missing_since: Option<Instant>,
    /// Natural stream end: keep mpv alive until this Instant for the offline OSD.
    offline_until: Option<Instant>,
}

/// Pre-launched mpv owned by a session (fast start): the window appears
/// immediately after clicking watch, and the stream is attached via IPC
/// once Streamlink's local HTTP server is up.
struct FastPlayer {
    child: Child,
    /// Kill-job for the player tree (fallback when the IPC quit fails).
    job: JobSlot,
    /// mpv IPC named pipe (`\\.\pipe\stgui-mpv-<uuid>`).
    pipe: String,
    /// --player-no-close: leave the player open when the stream ends.
    no_close: bool,
}

/// Send one command to mpv's IPC pipe, retrying until `timeout` (the pipe
/// appears shortly after the mpv process spawns).
#[cfg(windows)]
fn mpv_ipc_command(pipe: &str, cmd: &[&str], timeout: Duration) -> Result<(), StreamError> {
    use std::fs::OpenOptions;
    use std::io::{BufRead, BufReader, Write};
    let deadline = Instant::now() + timeout;
    let mut last_err: Option<std::io::Error> = None;
    while Instant::now() < deadline {
        match OpenOptions::new().read(true).write(true).open(pipe) {
            Ok(mut file) => {
                let msg = serde_json::json!({ "command": cmd }).to_string() + "\n";
                file.write_all(msg.as_bytes())?;
                // Events may precede the reply; read until the "error" field.
                let mut reader = BufReader::new(file);
                let mut line = String::new();
                for _ in 0..20 {
                    line.clear();
                    if reader.read_line(&mut line)? == 0 {
                        break;
                    }
                    if line.contains("\"error\"") {
                        if line.contains("\"success\"") {
                            return Ok(());
                        }
                        return Err(StreamError::Message(format!(
                            "mpv IPC error: {}",
                            line.trim()
                        )));
                    }
                }
                return Err(StreamError::Message("mpv IPC reply missing".into()));
            }
            Err(e) => {
                last_err = Some(e);
                thread::sleep(Duration::from_millis(50));
            }
        }
    }
    Err(StreamError::Message(format!(
        "mpv IPC connect failed: {last_err:?}"
    )))
}

#[cfg(not(windows))]
fn mpv_ipc_command(_pipe: &str, _cmd: &[&str], _timeout: Duration) -> Result<(), StreamError> {
    Err(StreamError::Message(
        "mpv IPC is only supported on Windows".into(),
    ))
}

/// Quit the pre-launched player (graceful IPC quit, then hard kill).
/// Idempotent via Option::take — stop, prune and the EOF watcher race here.
fn close_fast_player(player: &mut Option<FastPlayer>, graceful: bool) {
    let Some(mut p) = player.take() else {
        return;
    };
    if graceful {
        let _ = mpv_ipc_command(&p.pipe, &["quit"], Duration::from_millis(700));
        for _ in 0..10 {
            if matches!(p.child.try_wait(), Ok(Some(_))) {
                break;
            }
            thread::sleep(Duration::from_millis(50));
        }
    }
    let _ = p.child.kill();
    let _ = p.child.wait();
    terminate_job(&mut p.job);
}

/// Everything the output watcher needs to attach the pre-launched mpv once
/// Streamlink's local HTTP server is up (fast start).
struct FastPlayerCtx {
    pipe: String,
    port: u16,
    player_path: PathBuf,
    /// Dock argv for the fallback respawn (IPC failed): mpv <args> <url>.
    fallback_argv: Vec<String>,
    /// Guards one-time loadfile across the stdout/stderr watcher threads.
    fired: Arc<AtomicBool>,
    /// Guards one-time offline goodbye across the stdout/stderr watchers.
    goodbye: Arc<AtomicBool>,
    /// Last loading-phase text shown on the idle player's OSD (dedupe).
    osd: Mutex<String>,
    no_close: bool,
}

fn close_session_player(state: &StreamingState, id: &str, graceful: bool) {
    if let Ok(mut map) = state.inner.lock() {
        if let Some(session) = map.get_mut(id) {
            close_fast_player(&mut session.player, graceful);
        }
    }
}

const OFFLINE_GOODBYE_SECS: u64 = 5;

/// After a natural stream end: swap to the loading art, show an offline OSD,
/// wait a few seconds, then tear the session down.
fn begin_offline_goodbye(
    app: AppHandle,
    state: SharedStreaming,
    id: String,
    channel: String,
    pipe: String,
) {
    let status = format!("The streamer {channel} went offline");
    if let Ok(mut map) = state.inner.lock() {
        if let Some(session) = map.get_mut(&id) {
            session.offline_until =
                Some(Instant::now() + Duration::from_secs(OFFLINE_GOODBYE_SECS + 3));
            session.info.running = false;
            session.info.ready = false;
            session.info.phase = "ended".into();
            session.info.status = status.clone();
        }
    }
    emit_status(
        &app,
        StreamStatusPayload {
            id: id.clone(),
            channel: channel.clone(),
            line: status.clone(),
            status: status.clone(),
            phase: "ended".into(),
            ready: false,
        },
    );
    let _ = app.emit("stream-sessions-changed", ());

    thread::spawn(move || {
        // Replace the dead HTTP stream with the branded loading image so the
        // window looks like the startup screen again.
        if let Some(png) = loading_image_path() {
            let path = png.to_string_lossy().into_owned();
            let _ = mpv_ipc_command(&pipe, &["stop"], Duration::from_millis(800));
            let _ = mpv_ipc_command(&pipe, &["loadfile", &path], Duration::from_secs(2));
            let _ = mpv_ipc_command(
                &pipe,
                &["set_property", "image-display-duration", "inf"],
                Duration::from_millis(800),
            );
        }
        let _ = mpv_ipc_command(
            &pipe,
            &[
                "show-text",
                status.as_str(),
                &format!("{}", OFFLINE_GOODBYE_SECS * 1000),
            ],
            Duration::from_secs(2),
        );
        thread::sleep(Duration::from_secs(OFFLINE_GOODBYE_SECS));

        // Teardown: player first, then drop the session record.
        close_session_player(&state, &id, true);
        let empty = if let Ok(mut map) = state.inner.lock() {
            if let Some(mut session) = map.remove(&id) {
                let _ = session.child.kill();
                let _ = session.child.wait();
                terminate_job(&mut session.job);
                close_fast_player(&mut session.player, false);
                close_player_windows_for_channel(&channel);
            }
            map.is_empty()
        } else {
            false
        };
        if empty {
            close_owned_chatterino();
            crate::dock::clear_session();
        }
        let _ = app.emit("stream-sessions-changed", ());
    });
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

fn bundled_streamlink() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let dir = exe.parent()?;
    let candidates = [
        dir.join("resources")
            .join("streamlink")
            .join("streamlinkw.exe"),
        dir.join("streamlink").join("streamlinkw.exe"),
        // Dev: relative to src-tauri/resources
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("resources")
            .join("streamlink")
            .join("streamlinkw.exe"),
    ];
    candidates.into_iter().find(|p| p.is_file())
}

fn resolve_streamlink(
    source: &str,
    custom: Option<&str>,
) -> Result<(PathBuf, String), StreamError> {
    let custom_key = custom.map(str::to_string);
    if let Ok(guard) = streamlink_cache().lock() {
        if let Some((cached_source, cached_custom, path)) = guard.as_ref() {
            if cached_source == source && cached_custom.as_deref() == custom && path.is_file() {
                return Ok((path.clone(), cached_source.clone()));
            }
        }
    }

    let resolved = match source {
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
            (path, "custom".into())
        }
        "bundled" => {
            if let Some(path) = bundled_streamlink() {
                (path, "bundled".into())
            } else {
                find_streamlink_path()
                    .map(|p| (p, "system".into()))
                    .ok_or_else(|| StreamError::Message("Streamlink executable not found".into()))?
            }
        }
        _ => find_streamlink_path()
            .map(|p| (p, "system".into()))
            .ok_or_else(|| StreamError::Message("Streamlink executable not found".into()))?,
    };

    if let Ok(mut guard) = streamlink_cache().lock() {
        *guard = Some((source.to_string(), custom_key, resolved.0.clone()));
    }
    Ok(resolved)
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
            // Prefer fast fallbacks (no --version probes) for stream start latency.
            if id == "mpv" {
                if let Ok(guard) = mpv_cache().lock() {
                    if let Some(path) = guard.as_ref() {
                        if path.is_file() {
                            return Ok(Some(path.clone()));
                        }
                    }
                }
                if let Some(path) = find_mpv_path() {
                    if let Ok(mut guard) = mpv_cache().lock() {
                        *guard = Some(path.clone());
                    }
                    return Ok(Some(path));
                }
            }
            Err(StreamError::Message(format!(
                "player '{id}' not found on PATH"
            )))
        }
    }
}

fn default_player_args(player_id: &str, channel: &str, title: &str, game: &str) -> String {
    match player_id {
        // Fallback when the UI sends no args. Prefer frontend composeMpvPlayerArgs
        // (wiki Recommendations, verified against mpv master manual).
        "mpv" => {
            let label = format!("{channel} - {game} - {title}").replace('"', "");
            format!(
                "--force-window=yes --keep-open=yes --no-border --no-keepaspect-window --loop-playlist=inf --loop-file=inf --title=\"{label}\" --force-media-title=\"{label}\""
            )
        }
        "vlc" => {
            // Same stgui-<channel> marker mpv uses, so stop/prune can find
            // and close the window (close_player_windows_for_channel matches
            // the prefix). VLC shows it as "<title> - VLC media player".
            let label = mpv_window_title(channel);
            format!("--play-and-exit --input-title-format \"{label}\"")
        }
        _ => String::new(),
    }
}

pub fn launch_chatterino_for_channels(channels: &[String]) -> Result<String, StreamError> {
    let cleaned: Vec<String> = channels
        .iter()
        .map(|c| c.trim().trim_start_matches('#').to_lowercase())
        .filter(|c| !c.is_empty())
        .collect::<std::collections::BTreeSet<_>>()
        .into_iter()
        .collect();
    if cleaned.is_empty() {
        return Err(StreamError::Message("no channels for Chatterino".into()));
    }
    let path = cached_chatterino_path()
        .ok_or_else(|| StreamError::Message("Chatterino not found".into()))?;
    let list = cleaned
        .iter()
        .map(|c| format!("t:{c}"))
        .collect::<Vec<_>>()
        .join(";");
    // Replace previous owned instance so channel list stays in sync.
    close_owned_chatterino();
    launch_chatterino_with_path(&path, &list, true)?;
    Ok(path.to_string_lossy().into_owned())
}

fn normalize_layout(layout: Option<&str>) -> String {
    match layout.unwrap_or("2x2") {
        s @ ("1" | "2" | "2plus1" | "2x2" | "3plus1" | "3x2" | "4x2" | "8x1") => s.to_string(),
        _ => "2x2".into(),
    }
}

/// Kill the Chatterino process we spawned (never unrelated user windows).
pub fn close_owned_chatterino() {
    let pid = owned_chatterino_pid()
        .lock()
        .ok()
        .and_then(|mut g| g.take());
    let Some(pid) = pid else {
        return;
    };
    #[cfg(windows)]
    {
        // Prefer WM_CLOSE so Chatterino can flush settings (e.g. currentVersion
        // for the changelog prompt). Fall back to TerminateProcess.
        soft_close_pid(pid, Duration::from_millis(1500));
    }
    #[cfg(not(windows))]
    {
        let _ = pid;
    }
}

#[cfg(windows)]
fn soft_close_pid(pid: u32, timeout: Duration) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn PostMessageW(hwnd: *mut core::ffi::c_void, msg: u32, w: usize, l: isize) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut core::ffi::c_void;
        fn WaitForSingleObject(handle: *mut core::ffi::c_void, ms: u32) -> u32;
        fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
    }
    const WM_CLOSE: u32 = 0x0010;
    const SYNCHRONIZE: u32 = 0x0010_0000;
    const WAIT_OBJECT_0: u32 = 0;
    if let Some(hwnd) = find_main_window_for_pid(pid) {
        unsafe {
            let _ = PostMessageW(hwnd, WM_CLOSE, 0, 0);
        }
    }
    let handle = unsafe { OpenProcess(SYNCHRONIZE, 0, pid) };
    if !handle.is_null() {
        let waited = unsafe { WaitForSingleObject(handle, timeout.as_millis() as u32) };
        unsafe {
            let _ = CloseHandle(handle);
        }
        if waited == WAIT_OBJECT_0 {
            return;
        }
    }
    terminate_pid(pid);
}

#[cfg(windows)]
fn terminate_pid(pid: u32) {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut core::ffi::c_void;
        fn TerminateProcess(handle: *mut core::ffi::c_void, exit_code: u32) -> i32;
        fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
    }
    const PROCESS_TERMINATE: u32 = 0x0001;
    unsafe {
        let handle = OpenProcess(PROCESS_TERMINATE, 0, pid);
        if !handle.is_null() {
            let _ = TerminateProcess(handle, 1);
            let _ = CloseHandle(handle);
        }
    }
}

/// Prune the session the instant a fast session's pre-launched mpv exits —
/// evidence: mpv exits 0.2–0.3 s after its window is closed, so blocking on
/// the process handle closes the owned Chatterino in well under a second
/// instead of waiting for the 1.5 s watchdog tick.
#[cfg(windows)]
fn watch_player_exit(pid: u32, state: SharedStreaming, app: AppHandle) {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut core::ffi::c_void;
        fn WaitForSingleObject(handle: *mut core::ffi::c_void, ms: u32) -> u32;
        fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
    }
    const SYNCHRONIZE: u32 = 0x0010_0000;
    thread::spawn(move || unsafe {
        let handle = OpenProcess(SYNCHRONIZE, 0, pid);
        if handle.is_null() {
            return;
        }
        WaitForSingleObject(handle, u32::MAX);
        CloseHandle(handle);
        if let Ok(true) = prune_dead_sessions(&state) {
            let _ = app.emit("stream-sessions-changed", ());
        }
    });
}

/// Windows Job Object wrapper: terminating the job kills the whole process
/// tree rooted at the Streamlink child — including whatever player it spawned
/// (mpv/VLC/…), regardless of window titles. Children spawned by a job member
/// join the job automatically (Windows 8+), so even the orphaned player left
/// behind by a dead Streamlink is cleaned up.
#[cfg(windows)]
mod process_job {
    pub struct JobHandle(*mut core::ffi::c_void);
    unsafe impl Send for JobHandle {}

    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn CreateJobObjectW(
            attrs: *mut core::ffi::c_void,
            name: *const u16,
        ) -> *mut core::ffi::c_void;
        fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut core::ffi::c_void;
        fn AssignProcessToJobObject(
            job: *mut core::ffi::c_void,
            process: *mut core::ffi::c_void,
        ) -> i32;
        fn TerminateJobObject(job: *mut core::ffi::c_void, exit_code: u32) -> i32;
        fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
    }
    const PROCESS_SET_QUOTA: u32 = 0x0100;
    const PROCESS_TERMINATE: u32 = 0x0001;

    /// Create a job and assign the freshly spawned child (by PID) to it.
    /// Returns None on any failure — callers fall back to title-based closing.
    pub fn assign(pid: u32) -> Option<JobHandle> {
        unsafe {
            let job = CreateJobObjectW(std::ptr::null_mut(), std::ptr::null());
            if job.is_null() {
                return None;
            }
            let process = OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE, 0, pid);
            if process.is_null() {
                let _ = CloseHandle(job);
                return None;
            }
            let ok = AssignProcessToJobObject(job, process);
            let _ = CloseHandle(process);
            if ok == 0 {
                let _ = CloseHandle(job);
                return None;
            }
            Some(JobHandle(job))
        }
    }

    /// Terminate every process in the job and close the handle.
    pub fn terminate(job: JobHandle) {
        unsafe {
            let _ = TerminateJobObject(job.0, 1);
            let _ = CloseHandle(job.0);
        }
    }
}

#[cfg(windows)]
type JobSlot = Option<process_job::JobHandle>;
#[cfg(not(windows))]
type JobSlot = ();

fn assign_job(child: &Child) -> JobSlot {
    #[cfg(windows)]
    {
        process_job::assign(child.id())
    }
    #[cfg(not(windows))]
    {
        let _ = child;
    }
}

/// Kill the player's whole process tree (job). The title-based
/// `close_player_windows_for_channel` remains as a fallback for sessions
/// whose job assignment failed at spawn time.
fn terminate_job(slot: &mut JobSlot) {
    #[cfg(windows)]
    if let Some(job) = slot.take() {
        process_job::terminate(job);
    }
    #[cfg(not(windows))]
    let _ = slot;
}

/// Re-tile mpv windows for active channels; optionally leave the right strip for chat.
pub fn layout_watching(
    channels: &[String],
    reserve_chat: bool,
    layout: Option<&str>,
    linked_dock: Option<bool>,
    chat_fraction: Option<f64>,
    main_side: Option<&str>,
) -> Result<(), StreamError> {
    let cleaned: Vec<String> = channels
        .iter()
        .map(|c| c.trim().trim_start_matches('#').to_lowercase())
        .filter(|c| !c.is_empty())
        .collect();
    if cleaned.is_empty() {
        crate::dock::clear_session();
        return Ok(());
    }
    let layout = normalize_layout(layout);
    if let Some(f) = chat_fraction {
        crate::dock::set_chat_fraction(f);
    }
    if let Some(side) = main_side {
        crate::dock::set_main_side(side);
    }
    let linked = linked_dock.unwrap_or_else(|| crate::dock::snapshot().linked);
    crate::dock::sync_session(&cleaned, &layout, reserve_chat, linked);
    #[cfg(windows)]
    {
        let cleaned = cleaned.clone();
        let chat_pid = owned_chatterino_pid()
            .lock()
            .ok()
            .and_then(|g| *g)
            .unwrap_or(0);
        // Latest request wins: when several streams become ready at once, the
        // frontend fires layout_watching repeatedly. Older threads exit as
        // soon as they notice a newer generation instead of fighting over
        // window placement.
        let generation = LAYOUT_GENERATION.fetch_add(1, Ordering::SeqCst) + 1;
        let expected = cleaned.len().clamp(1, 8);
        thread::spawn(move || {
            thread::sleep(Duration::from_millis(400));
            let mut streak = 0;
            for _ in 0..28 {
                if LAYOUT_GENERATION.load(Ordering::SeqCst) != generation {
                    return;
                }
                let found = retile_player_windows(&cleaned, reserve_chat, &layout);
                let mut chat_ok = true;
                if reserve_chat && chat_pid != 0 {
                    chat_ok = find_main_window_for_pid(chat_pid).is_some();
                    if chat_ok {
                        place_chatterino_window_right(chat_pid);
                    }
                }
                if found >= expected && chat_ok {
                    streak += 1;
                    if streak >= 2 {
                        return;
                    }
                } else {
                    streak = 0;
                }
                thread::sleep(Duration::from_millis(250));
            }
        });
    }
    #[cfg(not(windows))]
    {
        let _ = (cleaned, reserve_chat, layout);
    }
    Ok(())
}

/// When true, skip retile/place so we don't un-minimize the dock group.
static DOCK_GROUP_MINIMIZED: AtomicBool = AtomicBool::new(false);

/// Immediate retile from dock grip drags (no delayed retry loop).
pub fn apply_dock_layout() {
    #[cfg(windows)]
    {
        if DOCK_GROUP_MINIMIZED.load(Ordering::SeqCst) {
            return;
        }
        let cfg = crate::dock::snapshot();
        if cfg.channels.is_empty() {
            return;
        }
        let _ = retile_player_windows(&cfg.channels, cfg.reserve_chat, &cfg.layout);
        if cfg.reserve_chat {
            place_chatterino_window_right(0);
        }
        if crate::dock::take_raise_after_apply() {
            raise_dock_windows(&cfg.channels, cfg.reserve_chat);
        }
    }
}

fn apply_dock_layout_cb() {
    apply_dock_layout();
}

static DOCK_APP: OnceLock<AppHandle> = OnceLock::new();

fn emit_dock_fraction(f: f64) {
    if let Some(app) = DOCK_APP.get() {
        let _ = app.emit("dock-chat-fraction", f);
    }
}

/// Register dock callbacks once the Tauri app handle exists.
pub fn init_dock(app: AppHandle) {
    let _ = DOCK_APP.set(app);
    crate::dock::register_apply_layout(apply_dock_layout_cb);
    crate::dock::register_fraction_emit(emit_dock_fraction);
    // Starts Win32 grip thread + global Ctrl+Shift+M (works while mpv focused).
    crate::dock::start_background();
    start_dock_visibility_watchdog();
}

#[cfg(windows)]
fn start_dock_visibility_watchdog() {
    static STARTED: AtomicBool = AtomicBool::new(false);
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }
    thread::spawn(|| {
        // 0 = shown/normal, 1 = minimized as a group
        let mut group_minimized = false;
        let mut seam_suppressed = false;
        loop {
            thread::sleep(Duration::from_millis(200));
            let cfg = crate::dock::snapshot();
            if !cfg.linked || cfg.channels.is_empty() {
                group_minimized = false;
                DOCK_GROUP_MINIMIZED.store(false, Ordering::SeqCst);
                continue;
            }
            let hwnds = dock_member_hwnds(&cfg.channels, cfg.reserve_chat);
            if hwnds.is_empty() {
                continue;
            }
            let any_iconic = hwnds.iter().any(|&h| is_hwnd_iconic(h));
            let any_zoomed = hwnds.iter().any(|&h| is_hwnd_zoomed(h));
            let any_restored = hwnds
                .iter()
                .any(|&h| is_hwnd_visible(h) && !is_hwnd_iconic(h));

            if !group_minimized && any_iconic {
                DOCK_GROUP_MINIMIZED.store(true, Ordering::SeqCst);
                minimize_dock_group(&hwnds);
                crate::dock::hide_grips();
                group_minimized = true;
                continue;
            }
            if group_minimized && any_restored {
                DOCK_GROUP_MINIMIZED.store(false, Ordering::SeqCst);
                restore_dock_group(&cfg.channels, cfg.reserve_chat, &cfg.layout);
                crate::dock::show_grips();
                group_minimized = false;
                continue;
            }
            // Solo maximize breaks the dock — snap everyone back to tiles.
            if !group_minimized && any_zoomed {
                restore_dock_group(&cfg.channels, cfg.reserve_chat, &cfg.layout);
                crate::dock::show_grips();
            }

            // Chatterino usercards/menus sit above the main chat window; our seam
            // grips used to be TOPMOST and sliced through them. Hide seam grips
            // while a secondary Chatterino window is visible.
            if cfg.reserve_chat && !group_minimized {
                let has_popup = chatterino_has_overlay_popup();
                if has_popup && !seam_suppressed {
                    crate::dock::suppress_seam_grips();
                    seam_suppressed = true;
                } else if !has_popup && seam_suppressed {
                    crate::dock::restore_seam_grips();
                    seam_suppressed = false;
                }
            } else if seam_suppressed {
                seam_suppressed = false;
            }
        }
    });
}

#[cfg(not(windows))]
fn start_dock_visibility_watchdog() {}

#[cfg(windows)]
fn chatterino_has_overlay_popup() -> bool {
    let pid = owned_chatterino_pid()
        .lock()
        .ok()
        .and_then(|g| *g)
        .unwrap_or(0);
    if pid == 0 {
        return false;
    }
    let Some(main) = find_main_window_for_pid(pid) else {
        return false;
    };
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetForegroundWindow() -> *mut core::ffi::c_void;
        fn GetWindowThreadProcessId(hwnd: *mut core::ffi::c_void, pid: *mut u32) -> u32;
        fn IsWindowVisible(hwnd: *mut core::ffi::c_void) -> i32;
        fn GetWindow(hwnd: *mut core::ffi::c_void, cmd: u32) -> *mut core::ffi::c_void;
        fn GetWindowRect(hwnd: *mut core::ffi::c_void, rect: *mut WinRect) -> i32;
    }
    const GW_OWNER: u32 = 4;
    unsafe {
        let fg = GetForegroundWindow();
        if fg.is_null() || fg == main || IsWindowVisible(fg) == 0 {
            return false;
        }
        let mut wpid = 0u32;
        GetWindowThreadProcessId(fg, &mut wpid);
        if wpid != pid {
            return false;
        }
        // Usercards are owned dialogs (or other non-main top-level) with real size.
        let owner = GetWindow(fg, GW_OWNER);
        let mut rc = WinRect {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        if GetWindowRect(fg, &mut rc) == 0 {
            return false;
        }
        let w = (rc.right - rc.left).max(0);
        let h = (rc.bottom - rc.top).max(0);
        if w < 120 || h < 120 {
            return false;
        }
        // Owned by main chat, or any other focused Chatterino window that isn't main.
        !owner.is_null() || fg != main
    }
}

#[cfg(windows)]
fn dock_member_hwnds(channels: &[String], reserve_chat: bool) -> Vec<*mut core::ffi::c_void> {
    let mut out = Vec::new();
    for channel in channels.iter().take(8) {
        let key = mpv_window_title(channel);
        if let Some(hwnd) = find_window_by_title(&key, true) {
            out.push(hwnd);
        }
    }
    if reserve_chat {
        let pid = owned_chatterino_pid()
            .lock()
            .ok()
            .and_then(|g| *g)
            .unwrap_or(0);
        if let Some(hwnd) = find_main_window_for_pid(pid) {
            out.push(hwnd);
        }
    }
    out
}

#[cfg(windows)]
fn is_hwnd_iconic(hwnd: *mut core::ffi::c_void) -> bool {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn IsIconic(hwnd: *mut core::ffi::c_void) -> i32;
    }
    !hwnd.is_null() && unsafe { IsIconic(hwnd) != 0 }
}

#[cfg(windows)]
fn is_hwnd_zoomed(hwnd: *mut core::ffi::c_void) -> bool {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn IsZoomed(hwnd: *mut core::ffi::c_void) -> i32;
    }
    !hwnd.is_null() && unsafe { IsZoomed(hwnd) != 0 }
}

#[cfg(windows)]
fn is_hwnd_visible(hwnd: *mut core::ffi::c_void) -> bool {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn IsWindowVisible(hwnd: *mut core::ffi::c_void) -> i32;
    }
    !hwnd.is_null() && unsafe { IsWindowVisible(hwnd) != 0 }
}

#[cfg(windows)]
fn minimize_dock_group(hwnds: &[*mut core::ffi::c_void]) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn ShowWindow(hwnd: *mut core::ffi::c_void, cmd: i32) -> i32;
    }
    const SW_MINIMIZE: i32 = 6;
    for &hwnd in hwnds {
        if !hwnd.is_null() {
            unsafe {
                let _ = ShowWindow(hwnd, SW_MINIMIZE);
            }
        }
    }
}

#[cfg(windows)]
fn restore_dock_group(channels: &[String], reserve_chat: bool, layout: &str) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn ShowWindow(hwnd: *mut core::ffi::c_void, cmd: i32) -> i32;
    }
    const SW_RESTORE: i32 = 9;
    let hwnds = dock_member_hwnds(channels, reserve_chat);
    for &hwnd in &hwnds {
        unsafe {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        }
    }
    let _ = retile_player_windows(channels, reserve_chat, layout);
    if reserve_chat {
        place_chatterino_window_right(0);
    }
    raise_dock_windows(channels, reserve_chat);
}

pub fn dock_set_linked(enabled: bool) {
    crate::dock::set_linked(enabled);
}

pub fn dock_set_chat_fraction(f: f64) {
    crate::dock::set_chat_fraction(f);
    apply_dock_layout();
}

pub fn dock_cycle_monitor() {
    crate::dock::cycle_monitor();
}

/// Monotonic counter serializing layout_watching retile threads (latest wins).
static LAYOUT_GENERATION: AtomicU64 = AtomicU64::new(0);

fn launch_chatterino_with_path(
    path: &Path,
    channels_arg: &str,
    place_beside: bool,
) -> Result<(), StreamError> {
    // Chatterino shows "Show changelog?" when misc.currentVersion ≠ binary
    // version. We often hard-restart it, so patch settings before spawn.
    #[cfg(windows)]
    suppress_chatterino_changelog_prompt(path);

    let mut cmd = Command::new(path);
    // Qt accepts -geometry before app args — open already sized (avoids big→small flash).
    #[cfg(windows)]
    if place_beside {
        if let Some((w, h, x, y)) = chatterino_qt_geometry() {
            cmd.arg("-geometry").arg(format!("{w}x{h}+{x}+{y}"));
        }
    }
    cmd.arg(format!("--channels={channels_arg}"))
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    let child = cmd.spawn().map_err(|err| {
        StreamError::Message(format!(
            "failed to start Chatterino ({}): {err}",
            path.display()
        ))
    })?;
    let pid = child.id();
    if let Ok(mut guard) = owned_chatterino_pid().lock() {
        *guard = Some(pid);
    }
    if place_beside {
        thread::spawn(move || {
            // Place our PID only, as soon as its window exists.
            for _ in 0..40 {
                place_chatterino_window_right(pid);
                #[cfg(windows)]
                if find_main_window_for_pid(pid).is_some() {
                    // One more snap after first paint / DWM frame settle.
                    thread::sleep(Duration::from_millis(80));
                    place_chatterino_window_right(pid);
                    break;
                }
                thread::sleep(Duration::from_millis(50));
            }
        });
    }
    thread::spawn(move || {
        let mut child = child;
        let _ = child.wait();
        if let Ok(mut guard) = owned_chatterino_pid().lock() {
            if *guard == Some(pid) {
                *guard = None;
            }
        }
    });
    Ok(())
}

/// Align `%APPDATA%\Chatterino2\Settings\settings.json` → `misc.currentVersion`
/// with the executable's ProductVersion so the changelog QMessageBox is skipped.
#[cfg(windows)]
fn suppress_chatterino_changelog_prompt(exe: &Path) {
    let Some(ver) = file_product_version(exe) else {
        return;
    };
    let Ok(appdata) = std::env::var("APPDATA") else {
        return;
    };
    let path = PathBuf::from(appdata)
        .join("Chatterino2")
        .join("Settings")
        .join("settings.json");
    if !path.is_file() {
        return;
    }
    let Ok(raw) = std::fs::read_to_string(&path) else {
        return;
    };
    let Ok(mut value) = serde_json::from_str::<serde_json::Value>(&raw) else {
        return;
    };
    let Some(misc) = value.get_mut("misc") else {
        // Create misc object if missing.
        value
            .as_object_mut()
            .map(|o| o.insert("misc".into(), serde_json::json!({ "currentVersion": ver })));
        let _ = std::fs::write(&path, serde_json::to_string_pretty(&value).unwrap_or(raw));
        return;
    };
    let current = misc
        .get("currentVersion")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    if current == ver {
        return;
    }
    if let Some(obj) = misc.as_object_mut() {
        obj.insert("currentVersion".into(), serde_json::Value::String(ver));
    }
    if let Ok(out) = serde_json::to_string_pretty(&value) {
        let _ = std::fs::write(&path, out);
    }
}

#[cfg(windows)]
fn file_product_version(exe: &Path) -> Option<String> {
    #[link(name = "version")]
    unsafe extern "system" {
        fn GetFileVersionInfoSizeW(path: *const u16, handle: *mut u32) -> u32;
        fn GetFileVersionInfoW(
            path: *const u16,
            handle: u32,
            len: u32,
            data: *mut core::ffi::c_void,
        ) -> i32;
        fn VerQueryValueW(
            block: *const core::ffi::c_void,
            sub: *const u16,
            buf: *mut *mut core::ffi::c_void,
            len: *mut u32,
        ) -> i32;
    }
    #[repr(C)]
    struct VsFixedFileInfo {
        signature: u32,
        struc_version: u32,
        file_version_ms: u32,
        file_version_ls: u32,
        product_version_ms: u32,
        product_version_ls: u32,
        file_flags_mask: u32,
        file_flags: u32,
        file_os: u32,
        file_type: u32,
        file_subtype: u32,
        file_date_ms: u32,
        file_date_ls: u32,
    }
    let wide: Vec<u16> = exe
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    unsafe {
        let mut dummy = 0u32;
        let size = GetFileVersionInfoSizeW(wide.as_ptr(), &mut dummy);
        if size == 0 {
            return None;
        }
        let mut buf = vec![0u8; size as usize];
        if GetFileVersionInfoW(wide.as_ptr(), 0, size, buf.as_mut_ptr().cast()) == 0 {
            return None;
        }
        let sub: Vec<u16> = "\\".encode_utf16().chain(std::iter::once(0)).collect();
        let mut ptr: *mut core::ffi::c_void = std::ptr::null_mut();
        let mut len = 0u32;
        if VerQueryValueW(buf.as_ptr().cast(), sub.as_ptr(), &mut ptr, &mut len) == 0
            || ptr.is_null()
            || (len as usize) < std::mem::size_of::<VsFixedFileInfo>()
        {
            return None;
        }
        let info = &*(ptr as *const VsFixedFileInfo);
        let major = (info.product_version_ms >> 16) & 0xffff;
        let minor = info.product_version_ms & 0xffff;
        let patch = (info.product_version_ls >> 16) & 0xffff;
        // Chatterino prints "7.5.5" (3-part); omit build when zero.
        let build = info.product_version_ls & 0xffff;
        if build == 0 {
            Some(format!("{major}.{minor}.{patch}"))
        } else {
            Some(format!("{major}.{minor}.{patch}.{build}"))
        }
    }
}

#[cfg(windows)]
fn chatterino_qt_geometry() -> Option<(i32, i32, i32, i32)> {
    let (_, Some(chat)) = chat_video_split(true)? else {
        return None;
    };
    let w = (chat.right - chat.left).max(1);
    let h = (chat.bottom - chat.top).max(1);
    Some((w, h, chat.left, chat.top))
}

#[cfg(windows)]
#[derive(Clone, Copy, Debug)]
#[repr(C)]
struct WinRect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[cfg(windows)]
fn rect_from_dock(r: crate::dock::Rect) -> WinRect {
    WinRect {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
    }
}

/// Video left / chat right. Uses linked-dock work monitor + chat fraction.
#[cfg(windows)]
fn chat_video_split(reserve_chat: bool) -> Option<(WinRect, Option<WinRect>)> {
    let (video, chat) = crate::dock::chat_video_split(reserve_chat)?;
    Some((rect_from_dock(video), chat.map(rect_from_dock)))
}

/// Effective grid for `count` running channels under the chosen preset.
/// A partially filled preset shrinks to the count-based grid, so a single
/// stream never lands in a quarter tile of the default "2x2" preset.
/// Asymmetric presets keep their split whenever 2+ channels run.
#[cfg(windows)]
fn effective_layout(count: usize, preset: &str) -> &str {
    if preset == "3plus1" && count >= 2 {
        return "3plus1";
    }
    if preset == "2plus1" && count >= 2 {
        return "2plus1";
    }
    if preset == "8x1" && count >= 2 {
        return "8x1";
    }
    match count {
        0 | 1 => "1",
        2 => "2",
        3 | 4 => "2x2",
        5 | 6 => "3x2",
        _ => "4x2",
    }
}

#[cfg(windows)]
fn tile_rect(video: WinRect, index: usize, layout: &str) -> WinRect {
    let r = crate::dock::tile_rect(
        crate::dock::Rect {
            left: video.left,
            top: video.top,
            right: video.right,
            bottom: video.bottom,
        },
        index,
        layout,
    );
    rect_from_dock(r)
}

/// Pixel-exact launch geometry for the planned tile, computed with the same
/// math as the retile pass (measured: mpv honors pixel geometry exactly, so
/// the window opens already snapped instead of resizing visibly afterwards).
/// The retile pass still runs afterwards — the final tiling depends on how
/// many streams are running once the player is ready, which can change
/// between launch and ready.
#[cfg(windows)]
fn mpv_geometry_for_dock(
    reserve_chat: bool,
    index: usize,
    count: usize,
    layout: Option<&str>,
) -> Option<String> {
    let (video, _) = chat_video_split(reserve_chat)?;
    let preset = normalize_layout(layout);
    let n = count.clamp(1, 8);
    let eff = effective_layout(n, &preset);
    let tile = tile_rect(video, index.min(n - 1), eff);
    let w = (tile.right - tile.left).max(1);
    let h = (tile.bottom - tile.top).max(1);
    Some(format!(
        "--geometry={w}x{h}+{x}+{y}",
        x = tile.left,
        y = tile.top
    ))
}

#[cfg(not(windows))]
fn mpv_geometry_for_dock(
    _reserve_chat: bool,
    _index: usize,
    _count: usize,
    _layout: Option<&str>,
) -> Option<String> {
    None
}

/// Dock arg parts for mpv, shared by the classic --player-args string and the
/// fast-start path, which spawns mpv directly with an argv vector.
/// Branded loading screen shown by the pre-launched idle player instead of
/// mpv's "Drop files or URLs" screen. Written to the temp dir once; the
/// stream's loadfile replaces the image when playback attaches.
fn loading_image_path() -> Option<PathBuf> {
    static BYTES: &[u8] = include_bytes!("../assets/loading.png");
    let path = std::env::temp_dir().join("stgui-loading.png");
    match std::fs::metadata(&path) {
        Ok(m) if m.len() as usize == BYTES.len() => Some(path),
        _ => std::fs::write(&path, BYTES).ok().map(|_| path),
    }
}

fn mpv_dock_arg_parts(
    channel: &str,
    reserve_chat: bool,
    preset_args: &str,
    index: usize,
    count: usize,
    layout: Option<&str>,
) -> Vec<String> {
    let geo = mpv_geometry_for_dock(reserve_chat, index, count, layout)
        .unwrap_or_else(|| "--geometry=82%x100%+0+0".into());
    let mut parts: Vec<String> = vec![
        // Geometry first; watch-later-options-clr stops mpv restoring an old window size.
        geo,
        "--force-window=yes".into(),
        // Stay open on EOF so we can show the offline screen; we quit via IPC.
        "--keep-open=yes".into(),
        "--no-border".into(),
        // Live: don't fill a demuxer cache before showing the first frame.
        "--cache=no".into(),
        "--demuxer-readahead-secs=0.5".into(),
        "--watch-later-options-clr".into(),
    ];
    // Options the dock owns; matching preset flags are dropped. Everything
    // else the user configured (loop-*, demuxer cache, custom extras, …) is
    // kept — silently discarding it made dock mode diverge from the settings.
    // mpv is last-one-wins for repeated options, so a preset --cache=yes
    // still overrides our --cache=no default above.
    const DOCK_OWNED: &[&str] = &[
        "--geometry",
        "--window-maximized",
        "--title",
        "--force-media-title",
        "--force-window",
        "--keep-open",
        "--no-border",
        "--watch-later-options-clr",
    ];
    for p in rebuild_player_args_preserving_quotes(preset_args) {
        let key = p.split('=').next().unwrap_or(p.as_str());
        if DOCK_OWNED.contains(&key) {
            continue;
        }
        if !parts.iter().any(|x| x == &p) {
            parts.push(p);
        }
    }
    // Unique title so Win32 can find this mpv window (not a browser tab named after the channel).
    parts.push(format!("--title={}", mpv_window_title(channel)));
    parts.push(format!("--force-media-title={}", mpv_window_title(channel)));
    parts
}

fn build_mpv_dock_args(
    channel: &str,
    reserve_chat: bool,
    preset_args: &str,
    index: usize,
    count: usize,
    layout: Option<&str>,
) -> String {
    mpv_dock_arg_parts(channel, reserve_chat, preset_args, index, count, layout).join(" ")
}

fn mpv_window_title(channel: &str) -> String {
    let ch = channel
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect::<String>();
    let ch = if ch.is_empty() {
        "stream".into()
    } else {
        ch.to_ascii_lowercase()
    };
    format!("stgui-{ch}")
}

/// Split player-args like a shell (keeps "quoted titles" as one token).
fn rebuild_player_args_preserving_quotes(args: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    let mut in_quotes = false;
    for c in args.chars() {
        match c {
            '"' => {
                in_quotes = !in_quotes;
                cur.push(c);
            }
            ch if ch.is_whitespace() && !in_quotes => {
                if !cur.is_empty() {
                    out.push(std::mem::take(&mut cur));
                }
            }
            ch => cur.push(ch),
        }
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// Prefer an exact title match (mpv `--title=channel`), else prefix / contains.
#[cfg(windows)]
fn find_window_by_title(needle: &str, exact_preferred: bool) -> Option<*mut core::ffi::c_void> {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn EnumWindows(
            cb: unsafe extern "system" fn(*mut core::ffi::c_void, isize) -> i32,
            lparam: isize,
        ) -> i32;
        fn IsWindowVisible(hwnd: *mut core::ffi::c_void) -> i32;
        fn GetWindow(hwnd: *mut core::ffi::c_void, cmd: u32) -> *mut core::ffi::c_void;
        fn GetWindowTextW(hwnd: *mut core::ffi::c_void, lp: *mut u16, n: i32) -> i32;
        fn GetWindowRect(hwnd: *mut core::ffi::c_void, rect: *mut WinRect) -> i32;
    }
    const GW_OWNER: u32 = 4;
    struct Data {
        needle: String,
        exact: *mut core::ffi::c_void,
        best: *mut core::ffi::c_void,
        best_area: i64,
    }
    unsafe extern "system" fn enum_cb(hwnd: *mut core::ffi::c_void, lparam: isize) -> i32 {
        let data = &mut *(lparam as *mut Data);
        if IsWindowVisible(hwnd) == 0 || !GetWindow(hwnd, GW_OWNER).is_null() {
            return 1;
        }
        let mut buf = [0u16; 512];
        let n = GetWindowTextW(hwnd, buf.as_mut_ptr(), buf.len() as i32);
        if n <= 0 {
            return 1;
        }
        let title = String::from_utf16_lossy(&buf[..n as usize]).to_ascii_lowercase();
        // Never steal browser / our own app windows when matching a channel name.
        if title.contains("chrome")
            || title.contains("firefox")
            || title.contains("edge")
            || title.contains("streamlink twitch")
        {
            return 1;
        }
        let is_exact = title == data.needle;
        let is_soft = title.contains(&data.needle);
        if !is_exact && !is_soft {
            return 1;
        }
        let mut rect = WinRect {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        if GetWindowRect(hwnd, &mut rect) == 0 {
            return 1;
        }
        let area = (rect.right - rect.left).max(0) as i64 * (rect.bottom - rect.top).max(0) as i64;
        if area < 20_000 {
            return 1;
        }
        if is_exact {
            data.exact = hwnd;
        }
        if area > data.best_area {
            data.best_area = area;
            data.best = hwnd;
        }
        1
    }
    let mut data = Data {
        needle: needle.to_ascii_lowercase(),
        exact: std::ptr::null_mut(),
        best: std::ptr::null_mut(),
        best_area: 0,
    };
    unsafe {
        EnumWindows(enum_cb, &mut data as *mut _ as isize);
    }
    if exact_preferred && !data.exact.is_null() {
        Some(data.exact)
    } else if !data.best.is_null() {
        Some(data.best)
    } else {
        None
    }
}

/// Place window on `rect`. `expand_dwm` fills invisible Win11 borders (use for Chatterino).
/// Borderless mpv should pass `expand_dwm = false`.
#[cfg(windows)]
fn move_hwnd_to(hwnd: *mut core::ffi::c_void, rect: WinRect, expand_dwm: bool) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetWindowRect(hwnd: *mut core::ffi::c_void, rect: *mut WinRect) -> i32;
        fn MoveWindow(
            hwnd: *mut core::ffi::c_void,
            x: i32,
            y: i32,
            w: i32,
            h: i32,
            repaint: i32,
        ) -> i32;
        fn ShowWindow(hwnd: *mut core::ffi::c_void, cmd: i32) -> i32;
        fn GetWindowLongPtrW(hwnd: *mut core::ffi::c_void, index: i32) -> isize;
        fn SetWindowLongPtrW(hwnd: *mut core::ffi::c_void, index: i32, value: isize) -> isize;
        fn SetWindowPos(
            hwnd: *mut core::ffi::c_void,
            after: *mut core::ffi::c_void,
            x: i32,
            y: i32,
            cx: i32,
            cy: i32,
            flags: u32,
        ) -> i32;
        fn SetThreadDpiAwarenessContext(context: isize) -> isize;
    }
    #[link(name = "dwmapi")]
    unsafe extern "system" {
        fn DwmGetWindowAttribute(
            hwnd: *mut core::ffi::c_void,
            attr: u32,
            pv: *mut core::ffi::c_void,
            size: u32,
        ) -> i32;
    }
    const DWMWA_EXTENDED_FRAME_BOUNDS: u32 = 9;
    const SW_RESTORE: i32 = 9;
    const GWL_STYLE: i32 = -16;
    const WS_MAXIMIZE: isize = 0x0100_0000;
    const WS_THICKFRAME: isize = 0x0004_0000;
    const WS_MAXIMIZEBOX: isize = 0x0001_0000;
    const SWP_NOMOVE: u32 = 0x0002;
    const SWP_NOSIZE: u32 = 0x0001;
    const SWP_NOZORDER: u32 = 0x0004;
    const SWP_FRAMECHANGED: u32 = 0x0020;
    const DPI_CTX: isize = -4;

    let target_w = (rect.right - rect.left).max(1);
    let target_h = (rect.bottom - rect.top).max(1);

    unsafe {
        let _prev = SetThreadDpiAwarenessContext(DPI_CTX);
        let mut style = GetWindowLongPtrW(hwnd, GWL_STYLE);
        if style & WS_MAXIMIZE != 0 {
            style &= !WS_MAXIMIZE;
            SetWindowLongPtrW(hwnd, GWL_STYLE, style);
        }
        // Dock owns Chatterino geometry — strip its resize border so dragging
        // the chat edge can't desync it from mpv.
        if expand_dwm && style & (WS_THICKFRAME | WS_MAXIMIZEBOX) != 0 {
            SetWindowLongPtrW(hwnd, GWL_STYLE, style & !(WS_THICKFRAME | WS_MAXIMIZEBOX));
            SetWindowPos(
                hwnd,
                std::ptr::null_mut(),
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED,
            );
        }
        ShowWindow(hwnd, SW_RESTORE);

        if !expand_dwm {
            MoveWindow(hwnd, rect.left, rect.top, target_w, target_h, 1);
            return;
        }

        let mut outer = WinRect {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        let mut frame = outer;
        let has_outer = GetWindowRect(hwnd, &mut outer) != 0;
        let has_frame = has_outer
            && DwmGetWindowAttribute(
                hwnd,
                DWMWA_EXTENDED_FRAME_BOUNDS,
                &mut frame as *mut _ as *mut _,
                std::mem::size_of::<WinRect>() as u32,
            ) == 0;

        let (x, y, w, h) = if has_outer && has_frame {
            let bl = frame.left - outer.left;
            let bt = frame.top - outer.top;
            let br = outer.right - frame.right;
            let bb = outer.bottom - frame.bottom;
            (
                rect.left - bl,
                rect.top - bt,
                target_w + bl + br,
                target_h + bt + bb,
            )
        } else {
            (rect.left, rect.top, target_w, target_h)
        };
        MoveWindow(hwnd, x, y, w.max(1), h.max(1), 1);

        if DwmGetWindowAttribute(
            hwnd,
            DWMWA_EXTENDED_FRAME_BOUNDS,
            &mut frame as *mut _ as *mut _,
            std::mem::size_of::<WinRect>() as u32,
        ) == 0
            && GetWindowRect(hwnd, &mut outer) != 0
        {
            let dx = rect.left - frame.left;
            let dy = rect.top - frame.top;
            let dw = rect.right - frame.right;
            let dh = rect.bottom - frame.bottom;
            if dx != 0 || dy != 0 || dw != 0 || dh != 0 {
                MoveWindow(
                    hwnd,
                    outer.left + dx,
                    outer.top + dy,
                    ((outer.right - outer.left) + dw).max(1),
                    ((outer.bottom - outer.top) + dh).max(1),
                    1,
                );
            }
        }
    }
}

#[cfg(windows)]
fn raise_hwnd(hwnd: *mut core::ffi::c_void, foreground: bool) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn SetWindowPos(
            hwnd: *mut core::ffi::c_void,
            after: *mut core::ffi::c_void,
            x: i32,
            y: i32,
            cx: i32,
            cy: i32,
            flags: u32,
        ) -> i32;
        fn BringWindowToTop(hwnd: *mut core::ffi::c_void) -> i32;
        fn SetForegroundWindow(hwnd: *mut core::ffi::c_void) -> i32;
        fn GetForegroundWindow() -> *mut core::ffi::c_void;
        fn GetWindowThreadProcessId(hwnd: *mut core::ffi::c_void, pid: *mut u32) -> u32;
        fn AttachThreadInput(attach: u32, attach_to: u32, attach_flag: i32) -> i32;
        fn ShowWindow(hwnd: *mut core::ffi::c_void, cmd: i32) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetCurrentThreadId() -> u32;
    }
    const HWND_TOP: isize = 0;
    const SWP_NOMOVE: u32 = 0x0002;
    const SWP_NOSIZE: u32 = 0x0001;
    const SWP_SHOWWINDOW: u32 = 0x0040;
    const SW_SHOW: i32 = 5;
    if hwnd.is_null() {
        return;
    }
    unsafe {
        ShowWindow(hwnd, SW_SHOW);
        SetWindowPos(
            hwnd,
            HWND_TOP as *mut core::ffi::c_void,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW,
        );
        BringWindowToTop(hwnd);
        if foreground {
            let fg = GetForegroundWindow();
            let mut fg_pid = 0u32;
            let fg_tid = GetWindowThreadProcessId(fg, &mut fg_pid);
            let our_tid = GetCurrentThreadId();
            if fg_tid != 0 && fg_tid != our_tid {
                AttachThreadInput(our_tid, fg_tid, 1);
                let _ = SetForegroundWindow(hwnd);
                AttachThreadInput(our_tid, fg_tid, 0);
            } else {
                let _ = SetForegroundWindow(hwnd);
            }
        }
    }
}

#[cfg(windows)]
fn raise_dock_windows(channels: &[String], reserve_chat: bool) {
    let mut first = true;
    for channel in channels.iter().take(8) {
        let key = mpv_window_title(channel);
        if let Some(hwnd) = find_window_by_title(&key, true) {
            raise_hwnd(hwnd, first);
            first = false;
        }
    }
    if reserve_chat {
        let pid = owned_chatterino_pid()
            .lock()
            .ok()
            .and_then(|g| *g)
            .unwrap_or(0);
        if let Some(hwnd) = find_main_window_for_pid(pid) {
            // Chat after video so it ends up in the Z-order next to mpv; don't steal FG from video.
            raise_hwnd(hwnd, false);
        }
    }
}

/// Largest visible top-level window owned by `pid` (our spawned Chatterino only).
#[cfg(windows)]
fn find_main_window_for_pid(pid: u32) -> Option<*mut core::ffi::c_void> {
    if pid == 0 {
        return None;
    }
    #[link(name = "user32")]
    unsafe extern "system" {
        fn EnumWindows(
            cb: unsafe extern "system" fn(*mut core::ffi::c_void, isize) -> i32,
            lparam: isize,
        ) -> i32;
        fn IsWindowVisible(hwnd: *mut core::ffi::c_void) -> i32;
        fn GetWindow(hwnd: *mut core::ffi::c_void, cmd: u32) -> *mut core::ffi::c_void;
        fn GetWindowThreadProcessId(hwnd: *mut core::ffi::c_void, pid: *mut u32) -> u32;
        fn GetWindowRect(hwnd: *mut core::ffi::c_void, rect: *mut WinRect) -> i32;
    }
    const GW_OWNER: u32 = 4;
    struct Data {
        pid: u32,
        best: *mut core::ffi::c_void,
        best_area: i64,
    }
    unsafe extern "system" fn enum_cb(hwnd: *mut core::ffi::c_void, lparam: isize) -> i32 {
        let data = &mut *(lparam as *mut Data);
        if IsWindowVisible(hwnd) == 0 || !GetWindow(hwnd, GW_OWNER).is_null() {
            return 1;
        }
        let mut wpid = 0u32;
        GetWindowThreadProcessId(hwnd, &mut wpid);
        if wpid != data.pid {
            return 1;
        }
        let mut rect = WinRect {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        if GetWindowRect(hwnd, &mut rect) == 0 {
            return 1;
        }
        let area = (rect.right - rect.left).max(0) as i64 * (rect.bottom - rect.top).max(0) as i64;
        if area < 10_000 {
            return 1;
        }
        if area > data.best_area {
            data.best_area = area;
            data.best = hwnd;
        }
        1
    }
    let mut data = Data {
        pid,
        best: std::ptr::null_mut(),
        best_area: 0,
    };
    unsafe {
        EnumWindows(enum_cb, &mut data as *mut _ as isize);
    }
    if data.best.is_null() {
        None
    } else {
        Some(data.best)
    }
}

#[cfg(windows)]
fn place_chatterino_window_right(pid: u32) {
    let Some((_, Some(chat))) = chat_video_split(true) else {
        return;
    };
    // Never fall back to "any Chatterino" — that steals the user's other windows.
    let target_pid = if pid != 0 {
        pid
    } else {
        owned_chatterino_pid()
            .lock()
            .ok()
            .and_then(|g| *g)
            .unwrap_or(0)
    };
    if let Some(hwnd) = find_main_window_for_pid(target_pid) {
        move_hwnd_to(hwnd, chat, true);
    }
}

#[cfg(not(windows))]
fn place_chatterino_window_right(_pid: u32) {}

#[cfg(windows)]
fn retile_player_windows(channels: &[String], reserve_chat: bool, layout: &str) -> usize {
    let Some((video, _)) = chat_video_split(reserve_chat) else {
        return 0;
    };
    let n = channels.len().clamp(1, 8);
    let eff = effective_layout(n, layout);
    let mut found = 0usize;
    for (i, channel) in channels.iter().take(n).enumerate() {
        let tile = tile_rect(video, i, eff);
        let key = mpv_window_title(channel);
        if let Some(hwnd) = find_window_by_title(&key, true) {
            // Borderless mpv: plain MoveWindow (DWM expand breaks no-border windows).
            move_hwnd_to(hwnd, tile, false);
            found += 1;
        }
    }
    found
}

fn strip_ansi(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut chars = input.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\u{1b}' {
            if chars.peek() == Some(&'[') {
                chars.next();
                for n in chars.by_ref() {
                    if n.is_ascii_alphabetic() {
                        break;
                    }
                }
            }
            continue;
        }
        out.push(c);
    }
    out
}

fn display_status(raw: &str) -> String {
    let cleaned = strip_ansi(raw).trim().to_string();
    // Drop Streamlink log prefixes like [cli][info]
    let mut s = cleaned.as_str();
    while s.starts_with('[') {
        if let Some(end) = s.find(']') {
            s = s[end + 1..].trim_start();
        } else {
            break;
        }
    }
    if s.is_empty() {
        cleaned
    } else {
        s.to_string()
    }
}

fn classify_line(line: &str) -> (&'static str, bool) {
    let lower = line.to_lowercase();
    if lower.contains("pre-roll ads") {
        ("ads", false)
    } else if lower.contains("player:")
        || lower.contains("starting player")
        || lower.contains("writing to player")
    {
        // Ready = the player process actually started. "Opening stream" only
        // means Streamlink began fetching — it must NOT mark the session
        // ready (layout, handoff and the missing-window grace all key off it).
        ("ready", true)
    } else if lower.contains("[error]") || lower.contains(" error:") || lower.contains("error: ") {
        ("error", false)
    } else if lower.contains("opening stream")
        || lower.contains("available streams")
        || lower.contains("found matching plugin")
    {
        ("starting", false)
    } else {
        ("info", false)
    }
}

fn update_session_status(state: &StreamingState, id: &str, status: &str, phase: &str, ready: bool) {
    if let Ok(mut map) = state.inner.lock() {
        if let Some(session) = map.get_mut(id) {
            session.info.status = status.to_string();
            session.info.phase = phase.to_string();
            if ready && !session.info.ready {
                session.ready_at = Some(Instant::now());
            }
            session.info.ready = ready;
        }
    }
}

fn emit_status(app: &AppHandle, payload: StreamStatusPayload) {
    let _ = app.emit("stream-status", payload);
}

fn schedule_handoff(
    app: AppHandle,
    state: SharedStreaming,
    session_id: String,
    replace_ids: Vec<String>,
    handoff_done: Arc<AtomicBool>,
) {
    if replace_ids.is_empty() {
        return;
    }
    if handoff_done.swap(true, Ordering::SeqCst) {
        return;
    }
    thread::spawn(move || {
        // Match StreamLinkerino: brief overlap for a smoother player swap.
        thread::sleep(Duration::from_millis(600));
        for old_id in replace_ids {
            if old_id == session_id {
                continue;
            }
            let _ = stop_stream(&state, &old_id);
        }
        let _ = app.emit("stream-sessions-changed", ());
    });
}

#[allow(clippy::too_many_arguments)]
fn spawn_output_readers(
    app: AppHandle,
    state: SharedStreaming,
    id: String,
    channel: String,
    stdout: impl std::io::Read + Send + 'static,
    stderr: impl std::io::Read + Send + 'static,
    replace_ids: Vec<String>,
    handoff_done: Arc<AtomicBool>,
    fast: Option<Arc<FastPlayerCtx>>,
) {
    let drain = |pipe: Box<dyn std::io::Read + Send>,
                 app: AppHandle,
                 state: SharedStreaming,
                 id: String,
                 channel: String,
                 replace_ids: Vec<String>,
                 handoff_done: Arc<AtomicBool>,
                 fast: Option<Arc<FastPlayerCtx>>,
                 emit_lines: bool| {
        thread::spawn(move || {
            let reader = BufReader::new(pipe);
            for line in reader.lines().map_while(Result::ok) {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                if !emit_lines {
                    continue;
                }
                // Fast start: Streamlink's local HTTP server is up — attach
                // the pre-launched mpv via IPC and mark the session ready.
                if let Some(fx) = fast.as_ref() {
                    let url = format!("http://127.0.0.1:{}/", fx.port);
                    if trimmed.contains(&url) && !fx.fired.swap(true, Ordering::SeqCst) {
                        let fx = fx.clone();
                        let app2 = app.clone();
                        let state2 = state.clone();
                        let id2 = id.clone();
                        let channel2 = channel.clone();
                        let replace2 = replace_ids.clone();
                        let handoff2 = handoff_done.clone();
                        thread::spawn(move || {
                            let attached = mpv_ipc_command(
                                &fx.pipe,
                                &["loadfile", &url],
                                Duration::from_secs(5),
                            )
                            .is_ok();
                            if attached {
                                // Clear the loading-phase show-text now that
                                // video frames are on screen.
                                let _ = mpv_ipc_command(
                                    &fx.pipe,
                                    &["show-text", "", "1"],
                                    Duration::from_secs(2),
                                );
                            }
                            if !attached {
                                // Fallback: spawn mpv with the URL directly
                                // (no IPC). Title-based closing still finds it.
                                let _ = Command::new(&fx.player_path)
                                    .args(&fx.fallback_argv)
                                    .arg(&url)
                                    .stdin(Stdio::null())
                                    .spawn();
                            }
                            let status = "Playing".to_string();
                            update_session_status(&state2, &id2, &status, "ready", true);
                            emit_status(
                                &app2,
                                StreamStatusPayload {
                                    id: id2.clone(),
                                    channel: channel2,
                                    line: "Starting player: mpv (fast start)".into(),
                                    status,
                                    phase: "ready".into(),
                                    ready: true,
                                },
                            );
                            schedule_handoff(app2, state2, id2, replace2, handoff2);
                        });
                        continue;
                    }
                }
                let status = display_status(trimmed);
                let (phase, ready) = classify_line(trimmed);
                // Mirror loading phases ("Waiting for pre-roll ads…",
                // resolving, errors) onto the idle player's OSD — show-text
                // repaints immediately and replaces the previous message.
                if let Some(fx) = fast.as_ref() {
                    if !fx.fired.load(Ordering::SeqCst) && phase != "info" {
                        if let Ok(mut last) = fx.osd.lock() {
                            if *last != status {
                                *last = status.clone();
                                let pipe = fx.pipe.clone();
                                let msg = status.clone();
                                thread::spawn(move || {
                                    let _ = mpv_ipc_command(
                                        &pipe,
                                        &["show-text", msg.as_str(), "600000"],
                                        Duration::from_secs(2),
                                    );
                                });
                            }
                        }
                    }
                }
                update_session_status(&state, &id, &status, phase, ready);
                emit_status(
                    &app,
                    StreamStatusPayload {
                        id: id.clone(),
                        channel: channel.clone(),
                        line: trimmed.to_string(),
                        status: status.clone(),
                        phase: phase.to_string(),
                        ready,
                    },
                );
                if ready {
                    schedule_handoff(
                        app.clone(),
                        state.clone(),
                        id.clone(),
                        replace_ids.clone(),
                        handoff_done.clone(),
                    );
                }
            }
            // Streamlink closed its pipes: the stream ended or it died.
            if let Some(fx) = fast.as_ref() {
                if fx.no_close {
                    // Leave the pre-launched player; prune the Streamlink session.
                } else if !fx.fired.load(Ordering::SeqCst) {
                    // Never attached playback — nothing to show; close now.
                    close_session_player(&state, &id, true);
                } else if !fx.goodbye.swap(true, Ordering::SeqCst) {
                    // Show branded offline screen for a few seconds, then quit.
                    begin_offline_goodbye(
                        app.clone(),
                        state.clone(),
                        id.clone(),
                        channel.clone(),
                        fx.pipe.clone(),
                    );
                    return;
                } else {
                    // Sibling drain thread already started goodbye.
                    return;
                }
            }
            // Prune right away (closes the owned Chatterino) instead of
            // waiting for the watchdog tick. Give the process handle a
            // moment to signal exit after its pipes closed.
            thread::sleep(Duration::from_millis(200));
            if let Ok(true) = prune_dead_sessions(&state) {
                let _ = app.emit("stream-sessions-changed", ());
            }
        });
    };

    // Streamlink 8.x on Windows writes CLI logs to stdout (stderr is empty).
    // Parse both so "Starting player" marks the session ready.
    drain(
        Box::new(stdout),
        app.clone(),
        state.clone(),
        id.clone(),
        channel.clone(),
        replace_ids.clone(),
        handoff_done.clone(),
        fast.clone(),
        true,
    );
    drain(
        Box::new(stderr),
        app,
        state,
        id,
        channel,
        replace_ids,
        handoff_done,
        fast,
        true,
    );
}

/// Grab a free loopback port for Streamlink's external HTTP server.
fn free_loopback_port() -> Result<u16, StreamError> {
    let listener = std::net::TcpListener::bind("127.0.0.1:0")?;
    Ok(listener.local_addr()?.port())
}

pub fn start_stream(
    app: &AppHandle,
    state: &SharedStreaming,
    req: LaunchRequest,
) -> Result<StreamSession, StreamError> {
    let channel = req.channel.trim().trim_start_matches('#').to_lowercase();
    if channel.is_empty() {
        return Err(StreamError::Message("channel is empty".into()));
    }
    // Twitch logins: 1–25 chars of [a-z0-9_]. Reject everything else so the
    // value is always safe to embed in URLs, window titles and player args.
    if channel.len() > 25
        || !channel
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_')
    {
        return Err(StreamError::Message(format!(
            "invalid channel name: {channel}"
        )));
    }

    let quality = req
        .quality
        .filter(|q| !q.is_empty())
        .unwrap_or_else(|| "best".into());
    // Quality is passed as a bare CLI argument to Streamlink; restrict it to
    // selector characters (e.g. "best", "720p60", "1080p,720p,best") so a
    // malformed settings value can never be interpreted as a flag.
    if quality.len() > 64
        || !quality
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, ',' | '_' | '+' | '-'))
    {
        return Err(StreamError::Message(format!(
            "invalid quality selector: {quality}"
        )));
    }
    let source = req.streamlink_source.as_deref().unwrap_or("bundled");
    let player_id = req.player_id.as_deref().unwrap_or("mpv");

    let (streamlink, _source_label) =
        resolve_streamlink(source, req.streamlink_custom_path.as_deref())?;
    let player = resolve_player(player_id, req.player_custom_path.as_deref())?;

    let title = req.title.clone().unwrap_or_else(|| channel.clone());
    let game = req.game.clone().unwrap_or_default();

    // Fast start (Windows + mpv + stdin pipe): pre-launch mpv idle so the
    // window appears immediately, then serve the stream through Streamlink's
    // loopback HTTP server and attach playback via mpv's IPC pipe (measured:
    // window at ~0.4 s instead of ~2.3 s after clicking watch).
    let reserve_chat = req.reserve_chat.unwrap_or(false);
    let slot_index = req.slot_index.unwrap_or(0) as usize;
    let slot_count = req.slot_count.unwrap_or(1) as usize;
    let preset_player_args = req
        .player_custom_args
        .clone()
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| default_player_args(player_id, &channel, &title, &game));
    let mut fast_player: Option<FastPlayer> = None;
    let mut fast_ctx: Option<Arc<FastPlayerCtx>> = None;
    let mut use_fast = false;
    let mut fast_pid: Option<u32> = None;
    #[cfg(windows)]
    if player_id == "mpv" && req.player_input.as_deref().unwrap_or("default") == "default" {
        if let Some(player_path) = &player {
            let no_close = req.player_no_close.unwrap_or(false);
            let port = free_loopback_port()?;
            let pipe = format!(r"\\.\pipe\stgui-mpv-{}", Uuid::new_v4().simple());
            let dock_argv = mpv_dock_arg_parts(
                &channel,
                reserve_chat,
                &preset_player_args,
                slot_index,
                slot_count,
                req.layout.as_deref(),
            );
            let mut idle_argv = dock_argv.clone();
            idle_argv.push("--idle=yes".into());
            idle_argv.push(format!("--input-ipc-server={pipe}"));
            // Branded loading screen instead of the "Drop files" idle screen.
            // image-display-duration=inf keeps it up until loadfile replaces it.
            idle_argv.push("--image-display-duration=inf".into());
            if let Some(png) = loading_image_path() {
                idle_argv.push(png.to_string_lossy().into_owned());
            }
            if let Ok(mpv_child) = Command::new(player_path)
                .args(&idle_argv)
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
            {
                let job = assign_job(&mpv_child);
                fast_pid = Some(mpv_child.id());
                // The idle window would be a black rectangle until the stream
                // attaches (~3 s). osd-msg1 does NOT repaint the idle window
                // (verified via PrintWindow screenshots) — show-text does.
                // Long duration; each later phase update replaces it.
                let osd_pipe = pipe.clone();
                let osd_msg = format!("Starting {channel}…");
                thread::spawn(move || {
                    let _ = mpv_ipc_command(
                        &osd_pipe,
                        &["show-text", osd_msg.as_str(), "600000"],
                        Duration::from_secs(3),
                    );
                });
                use_fast = true;
                fast_ctx = Some(Arc::new(FastPlayerCtx {
                    pipe: pipe.clone(),
                    port,
                    player_path: player_path.clone(),
                    fallback_argv: dock_argv,
                    fired: Arc::new(AtomicBool::new(false)),
                    goodbye: Arc::new(AtomicBool::new(false)),
                    osd: Mutex::new(String::new()),
                    no_close,
                }));
                fast_player = Some(FastPlayer {
                    child: mpv_child,
                    job,
                    pipe,
                    no_close,
                });
            }
        }
    }

    let mut args: Vec<String> = Vec::new();
    if req.low_latency.unwrap_or(false) {
        args.push("--twitch-low-latency".into());
    }
    if req.disable_ads.unwrap_or(false) {
        args.push("--twitch-disable-ads".into());
    }
    if !use_fast {
        match req.player_input.as_deref().unwrap_or("default") {
            "fifo" => args.push("--player-fifo".into()),
            "http" => args.push("--player-continuous-http".into()),
            // "default" = stdin pipe (recommended). Passthrough is intentionally unsupported.
            _ => {}
        }
    }
    if req.webbrowser.unwrap_or(false) {
        args.push("--webbrowser".into());
        args.push("yes".into());
        if req.webbrowser_headless.unwrap_or(true) {
            args.push("--webbrowser-headless".into());
            args.push("yes".into());
        }
        if let Some(exec) = req
            .webbrowser_executable
            .as_deref()
            .filter(|s| !s.is_empty())
        {
            args.push("--webbrowser-executable".into());
            args.push(exec.to_string());
        }
    } else {
        args.push("--webbrowser".into());
        args.push("no".into());
    }
    if let Some(delay) = req.retry_streams {
        args.push("--retry-streams".into());
        args.push(delay.to_string());
    }
    if let Some(max) = req.retry_max {
        args.push("--retry-max".into());
        args.push(max.to_string());
    }
    if req.player_no_close.unwrap_or(false) {
        args.push("--player-no-close".into());
    }
    // Parallel segment fetch + stream data as it arrives (faster first frame).
    args.push("--stream-segment-threads".into());
    args.push("3".into());
    args.push("--hls-segment-stream-data".into());
    if use_fast {
        // Serve the stream on loopback HTTP; the pre-launched mpv attaches
        // via IPC once the watcher sees the printed URL.
        let port = fast_ctx.as_ref().map(|fx| fx.port).unwrap_or(0);
        args.push("--player-external-http".into());
        // Loopback only — never expose the stream on the network.
        args.push("--player-external-http-interface".into());
        args.push("127.0.0.1".into());
        args.push("--player-external-http-port".into());
        args.push(port.to_string());
        // Exit when the stream ends so the player can be cleaned up.
        args.push("--player-external-http-continuous".into());
        args.push("no".into());
    } else {
        // Keep Streamlink's own title short so it doesn't override our mpv --title=.
        args.push("--title".into());
        args.push(mpv_window_title(&channel));
        if let Some(player_path) = &player {
            args.push("--player".into());
            args.push(player_path.to_string_lossy().to_string());
            let player_args = if player_id == "mpv" {
                build_mpv_dock_args(
                    &channel,
                    reserve_chat,
                    &preset_player_args,
                    slot_index,
                    slot_count,
                    req.layout.as_deref(),
                )
            } else {
                preset_player_args.clone()
            };
            if !player_args.is_empty() {
                args.push("--player-args".into());
                args.push(player_args);
            }
        }
    }
    args.push(format!("twitch.tv/{channel}"));
    args.push(quality.clone());

    let replace_existing = req.replace_existing.unwrap_or(false);
    let replace_ids = if replace_existing {
        let map = state
            .inner
            .lock()
            .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
        map.keys().cloned().collect::<Vec<_>>()
    } else {
        Vec::new()
    };

    let mut child_cmd = Command::new(&streamlink);
    child_cmd
        .args(&args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        child_cmd.creation_flags(CREATE_NO_WINDOW);
    }
    let mut child = match child_cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            // Don't leave the pre-launched idle player behind.
            close_fast_player(&mut fast_player, false);
            return Err(e.into());
        }
    };

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| StreamError::Message("failed to capture Streamlink stdout".into()))?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| StreamError::Message("failed to capture Streamlink stderr".into()))?;

    // Chatterino is opened from the frontend (`open_chatterino_chat`) so failures
    // surface in the UI. This worker only starts Streamlink/mpv.
    let id = Uuid::new_v4().to_string();
    let initial_status = if replace_ids.is_empty() {
        "Starting Streamlink…".to_string()
    } else {
        format!("Switching to {channel}…")
    };

    let info = StreamSession {
        id: id.clone(),
        channel: channel.clone(),
        quality,
        title: req.title,
        game: req.game,
        running: true,
        status: initial_status.clone(),
        phase: "starting".into(),
        ready: false,
        muted: false,
    };

    let handoff_done = Arc::new(AtomicBool::new(false));
    {
        // Put the child in a kill-job BEFORE inserting: the player it spawns
        // joins the job, so stop/prune can kill the whole tree.
        let job = assign_job(&child);
        let mut map = state
            .inner
            .lock()
            .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
        map.insert(
            id.clone(),
            LiveSession {
                info: info.clone(),
                child,
                job,
                player: fast_player,
                ready_at: None,
                mpv_missing_since: None,
                offline_until: None,
            },
        );
    }

    // Close the session (and with it the owned Chatterino) the instant the
    // pre-launched player process exits, e.g. the user closed its window.
    #[cfg(windows)]
    if let Some(pid) = fast_pid {
        watch_player_exit(pid, state.clone(), app.clone());
    }

    spawn_output_readers(
        app.clone(),
        state.clone(),
        id.clone(),
        channel.clone(),
        stdout,
        stderr,
        replace_ids,
        handoff_done,
        fast_ctx,
    );

    emit_status(
        app,
        StreamStatusPayload {
            id: info.id.clone(),
            channel: info.channel.clone(),
            line: initial_status.clone(),
            status: initial_status,
            phase: "starting".into(),
            ready: false,
        },
    );

    Ok(info)
}

pub fn list_sessions(state: &StreamingState) -> Result<Vec<StreamSession>, StreamError> {
    let _ = prune_dead_sessions(state)?;
    let map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    Ok(map.values().map(|s| s.info.clone()).collect())
}

/// Toggle mpv mute for a session (by id). Returns the new muted state.
pub fn toggle_stream_mute(state: &StreamingState, id: &str) -> Result<bool, StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    let session = map
        .get_mut(id)
        .ok_or_else(|| StreamError::Message(format!("unknown session {id}")))?;
    let next = !session.info.muted;
    let pipe = session
        .player
        .as_ref()
        .map(|p| p.pipe.clone())
        .ok_or_else(|| {
            StreamError::Message(
                "mute needs a fast-start mpv session (IPC). Restart the stream.".into(),
            )
        })?;
    let flag = if next { "yes" } else { "no" };
    mpv_ipc_command(
        &pipe,
        &["set_property", "mute", flag],
        Duration::from_millis(800),
    )?;
    session.info.muted = next;
    Ok(next)
}

/// Drop sessions whose Streamlink exited or (when ready) whose mpv window is gone.
/// Returns true if any session was removed.
pub fn prune_dead_sessions(state: &StreamingState) -> Result<bool, StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    let mut remove: Vec<(String, String)> = Vec::new();
    for (id, session) in map.iter_mut() {
        let child_dead = match session.child.try_wait() {
            Ok(Some(_)) => true,
            Ok(None) => false,
            Err(_) => true,
        };
        // Fast-start sessions own the pre-launched mpv, so its process state
        // is authoritative: closing the player window exits mpv even in
        // --idle mode. Detect that within one watchdog tick instead of
        // waiting out the MPV_MISSING_GRACE window-title timeout.
        let player_dead = session
            .player
            .as_mut()
            .map(|p| !matches!(p.child.try_wait(), Ok(None)))
            .unwrap_or(false);
        // Natural offline goodbye: keep mpv up until offline_until (unless the
        // user closed the player window themselves).
        let in_offline_grace = session
            .offline_until
            .map(|t| Instant::now() < t)
            .unwrap_or(false);
        if in_offline_grace && !player_dead {
            if child_dead {
                session.info.running = false;
                session.info.phase = "ended".into();
            }
            continue;
        }
        // The window-title lookup is a heuristic and can produce false
        // negatives (renamed window, Unicode title, DWM timing). Never kill a
        // stream on a single miss: require the player window to be missing
        // continuously for MPV_MISSING_GRACE before treating it as closed.
        let window_missing = session.info.ready
            && session
                .ready_at
                .map(|t| t.elapsed() > Duration::from_secs(8))
                .unwrap_or(false)
            && !mpv_window_alive(&session.info.channel);
        let mpv_gone = if window_missing {
            let since = session.mpv_missing_since.get_or_insert_with(Instant::now);
            since.elapsed() > MPV_MISSING_GRACE
        } else {
            session.mpv_missing_since = None;
            false
        };
        if child_dead || player_dead || mpv_gone {
            session.info.running = false;
            session.info.phase = "ended".into();
            if session.info.status.is_empty() {
                session.info.status = "Stopped".into();
            }
            remove.push((id.clone(), session.info.channel.clone()));
        }
    }
    if remove.is_empty() {
        return Ok(false);
    }
    for (id, channel) in &remove {
        let mut keep_player = false;
        if let Some(mut session) = map.remove(id) {
            // Natural end: honor --player-no-close and leave a pre-launched
            // player running (it becomes an unowned window of the user).
            keep_player = session.player.as_ref().is_some_and(|p| p.no_close);
            let _ = session.child.kill();
            let _ = session.child.wait();
            // Kill the whole tree (orphaned player included) via the job.
            terminate_job(&mut session.job);
            if keep_player {
                session.player = None;
            } else {
                close_fast_player(&mut session.player, true);
            }
        }
        if !keep_player {
            close_player_windows_for_channel(channel);
        }
    }
    if map.is_empty() {
        drop(map);
        close_owned_chatterino();
        crate::dock::clear_session();
    }
    Ok(true)
}

/// Background poll so closing mpv updates sessions without waiting for the UI refresh.
pub fn start_session_watchdog(app: AppHandle, state: SharedStreaming) {
    thread::spawn(move || loop {
        thread::sleep(Duration::from_millis(1500));
        match prune_dead_sessions(&state) {
            Ok(true) => {
                let _ = app.emit("stream-sessions-changed", ());
            }
            Ok(false) => {}
            Err(_) => {}
        }
    });
}

fn mpv_window_alive(channel: &str) -> bool {
    #[cfg(windows)]
    {
        find_window_by_title(&mpv_window_title(channel), true).is_some()
    }
    #[cfg(not(windows))]
    {
        let _ = channel;
        true
    }
}

pub fn stop_stream(state: &StreamingState, id: &str) -> Result<(), StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    if let Some(mut session) = map.remove(id) {
        let channel = session.info.channel.clone();
        let _ = session.child.kill();
        let _ = session.child.wait();
        // Streamlink exit leaves the player orphaned; with --loop-file=inf it
        // keeps replaying the buffer instead of closing. The job kills the
        // whole tree; title-based closing is the fallback.
        terminate_job(&mut session.job);
        // Explicit stop always closes a pre-launched player (no_close only
        // applies to natural stream ends).
        close_fast_player(&mut session.player, true);
        close_player_windows_for_channel(&channel);
    }
    let empty = map.is_empty();
    drop(map);
    if empty {
        close_owned_chatterino();
        crate::dock::clear_session();
    }
    Ok(())
}

pub fn stop_all(state: &StreamingState) -> Result<(), StreamError> {
    let mut map = state
        .inner
        .lock()
        .map_err(|_| StreamError::Message("streaming state poisoned".into()))?;
    let channels: Vec<String> = map.values().map(|s| s.info.channel.clone()).collect();
    for (_, mut session) in map.drain() {
        let _ = session.child.kill();
        let _ = session.child.wait();
        terminate_job(&mut session.job);
        close_fast_player(&mut session.player, true);
    }
    drop(map);
    for channel in channels {
        close_player_windows_for_channel(&channel);
    }
    close_owned_chatterino();
    crate::dock::clear_session();
    Ok(())
}

/// Close mpv/VLC windows whose title starts with the channel name.
fn close_player_windows_for_channel(channel: &str) {
    #[cfg(windows)]
    {
        close_player_windows_for_channel_windows(channel);
    }
    #[cfg(not(windows))]
    {
        let _ = channel;
    }
}

#[cfg(windows)]
fn close_player_windows_for_channel_windows(channel: &str) {
    use std::sync::Mutex;

    #[link(name = "user32")]
    unsafe extern "system" {
        fn EnumWindows(
            cb: unsafe extern "system" fn(*mut core::ffi::c_void, isize) -> i32,
            lparam: isize,
        ) -> i32;
        fn GetWindowTextW(hwnd: *mut core::ffi::c_void, lp: *mut u16, n: i32) -> i32;
        fn GetWindowThreadProcessId(hwnd: *mut core::ffi::c_void, pid: *mut u32) -> u32;
        fn IsWindowVisible(hwnd: *mut core::ffi::c_void) -> i32;
        fn PostMessageW(hwnd: *mut core::ffi::c_void, msg: u32, w: usize, l: isize) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut core::ffi::c_void;
        fn TerminateProcess(handle: *mut core::ffi::c_void, code: u32) -> i32;
        fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
    }

    const WM_CLOSE: u32 = 0x0010;
    const PROCESS_TERMINATE: u32 = 0x0001;

    struct Data {
        prefix: String,
        pids: Mutex<Vec<u32>>,
    }

    unsafe extern "system" fn enum_cb(hwnd: *mut core::ffi::c_void, lparam: isize) -> i32 {
        let data = &*(lparam as *const Data);
        if IsWindowVisible(hwnd) == 0 {
            return 1;
        }
        let mut buf = [0u16; 512];
        let n = GetWindowTextW(hwnd, buf.as_mut_ptr(), buf.len() as i32);
        if n <= 0 {
            return 1;
        }
        let title = String::from_utf16_lossy(&buf[..n as usize]);
        let lower = title.to_ascii_lowercase();
        let prefix = data.prefix.as_str();
        // Player windows we spawn are titled stgui-<channel> (mpv --title /
        // VLC --input-title-format); VLC appends " - VLC media player".
        if !(lower == prefix
            || lower.starts_with(&format!("{prefix} -"))
            || lower.starts_with(&format!("{prefix}:")))
        {
            return 1;
        }
        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid != 0 {
            if let Ok(mut pids) = data.pids.lock() {
                if !pids.contains(&pid) {
                    pids.push(pid);
                }
            }
        }
        // Ask politely first.
        PostMessageW(hwnd, WM_CLOSE, 0, 0);
        1
    }

    let data = Data {
        prefix: mpv_window_title(channel),
        pids: Mutex::new(Vec::new()),
    };
    unsafe {
        EnumWindows(enum_cb, &data as *const Data as isize);
    }

    // Give WM_CLOSE a moment, then force-kill remaining processes.
    thread::sleep(Duration::from_millis(250));
    let pids = data.pids.lock().map(|g| g.clone()).unwrap_or_default();
    for pid in pids {
        unsafe {
            let handle = OpenProcess(PROCESS_TERMINATE, 0, pid);
            if !handle.is_null() {
                TerminateProcess(handle, 1);
                CloseHandle(handle);
            }
        }
    }
}

pub type SharedStreaming = Arc<StreamingState>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opening_stream_is_starting_not_ready() {
        // Regression: "Opening stream" was treated as ready, which started
        // the layout/handoff/missing-window timers before the player existed.
        let (phase, ready) = classify_line("[cli][info] Opening stream: source (hls)");
        assert_eq!(phase, "starting");
        assert!(!ready);
    }

    #[test]
    fn starting_player_marks_ready() {
        let (phase, ready) =
            classify_line("[cli][info] Starting player: C:\\Program Files\\mpv\\mpv.exe");
        assert_eq!(phase, "ready");
        assert!(ready);
    }

    #[test]
    fn channel_and_quality_validation() {
        // mpv_window_title strips anything outside [a-z0-9_-].
        assert_eq!(mpv_window_title("Some_Channel-1"), "stgui-some_channel-1");
        assert_eq!(mpv_window_title("äöü"), "stgui-stream");
    }

    #[test]
    #[ignore = "diagnostic: needs a live mpv with IPC pipe (STGUI_PROBE_PIPE)"]
    #[cfg(windows)]
    fn probe_mpv_ipc() {
        let pipe = std::env::var("STGUI_PROBE_PIPE").expect("STGUI_PROBE_PIPE not set");
        let result = mpv_ipc_command(
            &pipe,
            &["get_property", "mpv-version"],
            Duration::from_secs(3),
        );
        println!("EVID ipc get_property: {:?}", result.is_ok());
        assert!(result.is_ok(), "mpv IPC command failed: {result:?}");
    }

    #[test]
    #[ignore = "diagnostic: needs a live mpv probe window (STGUI_PROBE_CHANNEL); moves windows"]
    #[cfg(windows)]
    fn probe_layout_evidence() {
        #[link(name = "user32")]
        unsafe extern "system" {
            fn GetWindowRect(hwnd: *mut core::ffi::c_void, rect: *mut WinRect) -> i32;
        }
        fn rect_of(hwnd: *mut core::ffi::c_void) -> Option<WinRect> {
            let mut r = WinRect {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            };
            (unsafe { GetWindowRect(hwnd, &mut r) } != 0).then_some(r)
        }

        let channels: Vec<String> = std::env::var("STGUI_PROBE_CHANNEL")
            .unwrap_or_else(|_| "probe".into())
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        let layout = std::env::var("STGUI_PROBE_LAYOUT").unwrap_or_else(|_| "2x2".into());
        let (video, chat) = chat_video_split(true).expect("chat_video_split");
        println!("EVID video area: {video:?}");
        println!("EVID chat area:  {chat:?}");
        println!(
            "EVID effective_layout(count={}, preset={layout}) = {}",
            channels.len(),
            effective_layout(channels.len(), &layout)
        );
        for (i, channel) in channels.iter().enumerate() {
            println!(
                "EVID launch geometry idx {i}: {:?}",
                mpv_geometry_for_dock(true, i, channels.len(), Some(&layout))
            );
            let key = mpv_window_title(channel);
            match find_window_by_title(&key, true) {
                Some(hwnd) => println!(
                    "EVID window '{key}' (idx {i}): found, rect before = {:?}",
                    rect_of(hwnd)
                ),
                None => println!("EVID window '{key}' (idx {i}): NOT FOUND"),
            }
        }
        let found = retile_player_windows(&channels, true, &layout);
        println!("EVID retile(layout={layout}) found={found}");
        for channel in &channels {
            let key = mpv_window_title(channel);
            if let Some(hwnd) = find_window_by_title(&key, true) {
                println!("EVID window '{key}': rect after = {:?}", rect_of(hwnd));
            }
        }
    }

    #[test]
    #[cfg(windows)]
    fn partially_filled_presets_shrink_to_count_grid() {
        // Regression: one stream under the default "2x2" preset was tiled into
        // the top-left quarter instead of filling the video area.
        assert_eq!(effective_layout(1, "2x2"), "1");
        assert_eq!(effective_layout(2, "2x2"), "2");
        assert_eq!(effective_layout(3, "2x2"), "2x2");
        assert_eq!(effective_layout(4, "4x2"), "2x2");
        assert_eq!(effective_layout(6, "4x2"), "3x2");
        assert_eq!(effective_layout(8, "4x2"), "4x2");
        // 3plus1 keeps its asymmetric main+stack split for 2+ channels.
        assert_eq!(effective_layout(1, "3plus1"), "1");
        assert_eq!(effective_layout(2, "3plus1"), "3plus1");
    }

    #[test]
    fn dock_args_keep_custom_extras_but_drop_owned_flags() {
        // Regression: dock mode silently discarded all custom mpv args except
        // --no-keepaspect-window and --loop-*.
        let args = build_mpv_dock_args(
            "chan",
            false,
            "--loop-file=inf --cache=yes --volume=42 --title=\"chan - g - t\" --geometry=50%x50%+0+0 --window-maximized=yes",
            0,
            1,
            Some("2x2"),
        );
        assert!(args.contains("--loop-file=inf"));
        assert!(args.contains("--cache=yes"));
        assert!(args.contains("--volume=42"));
        // Dock owns geometry and window title.
        assert!(!args.contains("--geometry=50%x50%"));
        assert!(!args.contains("--window-maximized"));
        assert!(!args.contains("chan - g - t"));
        assert!(args.contains("--title=stgui-chan"));
        assert!(args.contains("--force-media-title=stgui-chan"));
    }
}
