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
    /// When the player became ready — grace before treating missing mpv as closed.
    ready_at: Option<Instant>,
    /// First moment the player window was observed missing (None = seen alive).
    /// The window-title lookup is only a heuristic, so a session is treated as
    /// closed solely on missing titles after a long, continuous absence.
    mpv_missing_since: Option<Instant>,
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
                "--force-window=yes --keep-open=no --no-border --no-keepaspect-window --loop-playlist=inf --loop-file=inf --title=\"{label}\" --force-media-title=\"{label}\""
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
        s @ ("1" | "2" | "2x2" | "3plus1" | "3x2" | "4x2") => s.to_string(),
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
        terminate_pid(pid);
    }
    #[cfg(not(windows))]
    {
        let _ = pid;
    }
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
) -> Result<(), StreamError> {
    let cleaned: Vec<String> = channels
        .iter()
        .map(|c| c.trim().trim_start_matches('#').to_lowercase())
        .filter(|c| !c.is_empty())
        .collect();
    if cleaned.is_empty() {
        return Ok(());
    }
    let layout = normalize_layout(layout);
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
            // Retry until every expected player window was tiled and the chat
            // placed, capped at ~7 s. The mpv window can lag the "Starting
            // player" log line by seconds (AV scans, cold start), so a short
            // fixed retry window sometimes missed it and left the player at
            // its approximate launch geometry.
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

/// Monotonic counter serializing layout_watching retile threads (latest wins).
static LAYOUT_GENERATION: AtomicU64 = AtomicU64::new(0);

fn launch_chatterino_with_path(
    path: &Path,
    channels_arg: &str,
    place_beside: bool,
) -> Result<(), StreamError> {
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
#[repr(C)]
struct MonitorInfo {
    cb_size: u32,
    rc_monitor: WinRect,
    rc_work: WinRect,
    dw_flags: u32,
}

#[cfg(windows)]
#[derive(Clone, Copy)]
#[repr(C)]
struct Point {
    x: i32,
    y: i32,
}

#[cfg(windows)]
#[repr(C)]
struct AppBarData {
    cb_size: u32,
    hwnd: *mut core::ffi::c_void,
    callback_message: u32,
    edge: u32,
    rc: WinRect,
    lparam: isize,
}

/// Primary monitor work rect, clamped with the taskbar so chat input stays visible.
#[cfg(windows)]
fn primary_monitor_work() -> Option<WinRect> {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn MonitorFromPoint(pt: Point, flags: u32) -> *mut core::ffi::c_void;
        fn GetMonitorInfoW(monitor: *mut core::ffi::c_void, info: *mut MonitorInfo) -> i32;
        fn SystemParametersInfoW(
            action: u32,
            ui_param: u32,
            pv_param: *mut core::ffi::c_void,
            win_ini: u32,
        ) -> i32;
        fn SetThreadDpiAwarenessContext(context: isize) -> isize;
    }
    #[link(name = "shell32")]
    unsafe extern "system" {
        fn SHAppBarMessage(msg: u32, data: *mut AppBarData) -> usize;
    }

    // DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 = -4
    const DPI_CTX: isize = -4;
    const MONITOR_DEFAULTTOPRIMARY: u32 = 1;
    const SPI_GETWORKAREA: u32 = 0x0030;
    const ABM_GETTASKBARPOS: u32 = 5;
    const ABE_LEFT: u32 = 0;
    const ABE_TOP: u32 = 1;
    const ABE_RIGHT: u32 = 2;
    const ABE_BOTTOM: u32 = 3;

    unsafe {
        let _prev = SetThreadDpiAwarenessContext(DPI_CTX);
        let monitor = MonitorFromPoint(Point { x: 0, y: 0 }, MONITOR_DEFAULTTOPRIMARY);
        let mut work = WinRect {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        if !monitor.is_null() {
            let mut info = MonitorInfo {
                cb_size: std::mem::size_of::<MonitorInfo>() as u32,
                rc_monitor: work,
                rc_work: work,
                dw_flags: 0,
            };
            if GetMonitorInfoW(monitor, &mut info) != 0 {
                work = info.rc_work;
            }
        }
        if (work.right <= work.left || work.bottom <= work.top)
            && SystemParametersInfoW(SPI_GETWORKAREA, 0, &mut work as *mut _ as *mut _, 0) == 0
        {
            return None;
        }

        // Extra clamp using the real taskbar rect (fixes cases where rcWork is wrong).
        let mut abd = AppBarData {
            cb_size: std::mem::size_of::<AppBarData>() as u32,
            hwnd: std::ptr::null_mut(),
            callback_message: 0,
            edge: 0,
            rc: WinRect {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            lparam: 0,
        };
        if SHAppBarMessage(ABM_GETTASKBARPOS, &mut abd) != 0 {
            match abd.edge {
                ABE_BOTTOM if abd.rc.top > work.top => {
                    work.bottom = work.bottom.min(abd.rc.top);
                }
                ABE_TOP if abd.rc.bottom < work.bottom => {
                    work.top = work.top.max(abd.rc.bottom);
                }
                ABE_LEFT if abd.rc.right < work.right => {
                    work.left = work.left.max(abd.rc.right);
                }
                ABE_RIGHT if abd.rc.left > work.left => {
                    work.right = work.right.min(abd.rc.left);
                }
                _ => {}
            }
        }

        if work.right > work.left && work.bottom > work.top {
            Some(work)
        } else {
            None
        }
    }
}

#[cfg(windows)]
const CHAT_FRACTION: f64 = 0.18; // ~40% narrower than 0.30 — more room for video

/// Video left / chat right. Vertical band uses the work area so mpv OSC and chat
/// input stay above the taskbar (full screen height put controls under the bar).
#[cfg(windows)]
fn chat_video_split(reserve_chat: bool) -> Option<(WinRect, Option<WinRect>)> {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetSystemMetrics(index: i32) -> i32;
        fn SetThreadDpiAwarenessContext(context: isize) -> isize;
    }
    const SM_CXSCREEN: i32 = 0;
    const SM_CYSCREEN: i32 = 1;
    const DPI_CTX: isize = -4;

    unsafe {
        let _prev = SetThreadDpiAwarenessContext(DPI_CTX);
    }
    let screen_w = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let screen_h = unsafe { GetSystemMetrics(SM_CYSCREEN) };
    if screen_w <= 0 || screen_h <= 0 {
        return None;
    }
    let work = primary_monitor_work().unwrap_or(WinRect {
        left: 0,
        top: 0,
        right: screen_w,
        bottom: screen_h,
    });

    if !reserve_chat {
        return Some((work, None));
    }

    let chat_w = ((screen_w as f64) * CHAT_FRACTION).round() as i32;
    let chat = WinRect {
        left: screen_w - chat_w,
        top: work.top,
        right: screen_w,
        bottom: work.bottom,
    };
    let video = WinRect {
        left: work.left,
        top: work.top,
        right: chat.left,
        bottom: work.bottom,
    };
    Some((video, Some(chat)))
}

#[cfg(windows)]
fn tile_rect(video: WinRect, index: usize, layout: &str) -> WinRect {
    let vw = video.right - video.left;
    let vh = video.bottom - video.top;
    if layout == "3plus1" {
        let main_w = (vw as f64 * 2.0 / 3.0).round() as i32;
        if index == 0 {
            return WinRect {
                left: video.left,
                top: video.top,
                right: video.left + main_w,
                bottom: video.bottom,
            };
        }
        let slot = (index - 1).min(2) as i32;
        let cell_h = vh / 3;
        return WinRect {
            left: video.left + main_w,
            top: video.top + slot * cell_h,
            right: video.right,
            bottom: if slot == 2 {
                video.bottom
            } else {
                video.top + (slot + 1) * cell_h
            },
        };
    }
    let (cols, rows) = match layout {
        "1" => (1, 1),
        "2" => (2, 1),
        "2x2" => (2, 2),
        "3x2" => (3, 2),
        "4x2" => (4, 2),
        _ => (2, 2),
    };
    let max_i = (cols * rows).max(1) - 1;
    let i = index.min(max_i);
    let cell_w = vw / cols as i32;
    let cell_h = vh / rows as i32;
    let col = (i % cols) as i32;
    let row = (i / cols) as i32;
    WinRect {
        left: video.left + col * cell_w,
        top: video.top + row * cell_h,
        right: video.left + (col + 1) * cell_w,
        bottom: video.top + (row + 1) * cell_h,
    }
}

/// Percent geometry at launch (mpv handles this reliably). Win32 MoveWindow then snaps to pixels.
/// Height follows the work area so controls are not created under the taskbar.
#[cfg(windows)]
fn mpv_geometry_for_dock(reserve_chat: bool, _index: usize, _count: usize) -> Option<String> {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetSystemMetrics(index: i32) -> i32;
        fn SetThreadDpiAwarenessContext(context: isize) -> isize;
    }
    const SM_CXSCREEN: i32 = 0;
    const SM_CYSCREEN: i32 = 1;
    unsafe {
        let _prev = SetThreadDpiAwarenessContext(-4);
    }
    let screen_w = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let screen_h = unsafe { GetSystemMetrics(SM_CYSCREEN) };
    if screen_w <= 0 || screen_h <= 0 {
        return None;
    }
    let (video, _) = chat_video_split(reserve_chat)?;
    let w = (video.right - video.left).max(1);
    let h = (video.bottom - video.top).max(1);
    let w_pct = ((w as f64 / screen_w as f64) * 100.0).round() as i32;
    let h_pct = ((h as f64 / screen_h as f64) * 100.0).round() as i32;
    Some(format!(
        "--geometry={w_pct}%x{h_pct}%+{x}+{y}",
        x = video.left,
        y = video.top
    ))
}

#[cfg(not(windows))]
fn mpv_geometry_for_dock(_reserve_chat: bool, _index: usize, _count: usize) -> Option<String> {
    None
}

fn build_mpv_dock_args(channel: &str, reserve_chat: bool, preset_args: &str) -> String {
    let geo = mpv_geometry_for_dock(reserve_chat, 0, 1)
        .unwrap_or_else(|| "--geometry=82%x100%+0+0".into());
    let mut parts: Vec<String> = vec![
        // Geometry first; watch-later-options-clr stops mpv restoring an old window size.
        geo,
        "--force-window=yes".into(),
        "--keep-open=no".into(),
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
    parts.join(" ")
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
    const DPI_CTX: isize = -4;

    let target_w = (rect.right - rect.left).max(1);
    let target_h = (rect.bottom - rect.top).max(1);

    unsafe {
        let _prev = SetThreadDpiAwarenessContext(DPI_CTX);
        let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
        if style & WS_MAXIMIZE != 0 {
            SetWindowLongPtrW(hwnd, GWL_STYLE, style & !WS_MAXIMIZE);
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
    let mut found = 0usize;
    for (i, channel) in channels.iter().take(n).enumerate() {
        let tile = tile_rect(video, i, layout);
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
) {
    let drain = |pipe: Box<dyn std::io::Read + Send>,
                 app: AppHandle,
                 state: SharedStreaming,
                 id: String,
                 channel: String,
                 replace_ids: Vec<String>,
                 handoff_done: Arc<AtomicBool>,
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
                let status = display_status(trimmed);
                let (phase, ready) = classify_line(trimmed);
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
        true,
    );
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

    let mut args: Vec<String> = Vec::new();
    if req.low_latency.unwrap_or(false) {
        args.push("--twitch-low-latency".into());
    }
    if req.disable_ads.unwrap_or(false) {
        args.push("--twitch-disable-ads".into());
    }
    match req.player_input.as_deref().unwrap_or("default") {
        "fifo" => args.push("--player-fifo".into()),
        "http" => args.push("--player-continuous-http".into()),
        // "default" = stdin pipe (recommended). Passthrough is intentionally unsupported.
        _ => {}
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
    // Keep Streamlink's own title short so it doesn't override our mpv --title=.
    args.push("--title".into());
    args.push(mpv_window_title(&channel));
    if let Some(player_path) = &player {
        args.push("--player".into());
        args.push(player_path.to_string_lossy().to_string());
        let mut player_args = req
            .player_custom_args
            .clone()
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| default_player_args(player_id, &channel, &title, &game));
        let reserve_chat = req.reserve_chat.unwrap_or(false);
        if player_id == "mpv" {
            player_args = build_mpv_dock_args(&channel, reserve_chat, &player_args);
        }
        if !player_args.is_empty() {
            args.push("--player-args".into());
            args.push(player_args);
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
    let mut child = child_cmd.spawn()?;

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
                ready_at: None,
                mpv_missing_since: None,
            },
        );
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
        if child_dead || mpv_gone {
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
        if let Some(mut session) = map.remove(id) {
            let _ = session.child.kill();
            let _ = session.child.wait();
            // Kill the whole tree (orphaned player included) via the job.
            terminate_job(&mut session.job);
        }
        close_player_windows_for_channel(channel);
    }
    if map.is_empty() {
        drop(map);
        close_owned_chatterino();
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
        close_player_windows_for_channel(&channel);
    }
    let empty = map.is_empty();
    drop(map);
    if empty {
        close_owned_chatterino();
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
    }
    drop(map);
    for channel in channels {
        close_player_windows_for_channel(&channel);
    }
    close_owned_chatterino();
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
    fn dock_args_keep_custom_extras_but_drop_owned_flags() {
        // Regression: dock mode silently discarded all custom mpv args except
        // --no-keepaspect-window and --loop-*.
        let args = build_mpv_dock_args(
            "chan",
            false,
            "--loop-file=inf --cache=yes --volume=42 --title=\"chan - g - t\" --geometry=50%x50%+0+0 --window-maximized=yes",
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
