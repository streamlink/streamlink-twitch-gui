//! Linked dock: shared chat|video fraction, multi-monitor work area, and
//! always-on-top grip windows (Windows) for live resize / move.

#![allow(
    clippy::type_complexity,
    clippy::needless_return,
    clippy::needless_range_loop
)]

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Mutex, OnceLock};
use std::thread;
use std::time::Duration;

pub const DEFAULT_CHAT_FRACTION: f64 = 0.18;
pub const MIN_CHAT_FRACTION: f64 = 0.12;
pub const MAX_CHAT_FRACTION: f64 = 0.45;

#[derive(Clone, Copy, Debug, Default)]
#[repr(C)]
pub struct Rect {
    pub left: i32,
    pub top: i32,
    pub right: i32,
    pub bottom: i32,
}

impl Rect {
    pub fn width(self) -> i32 {
        (self.right - self.left).max(0)
    }
    pub fn height(self) -> i32 {
        (self.bottom - self.top).max(0)
    }
}

#[derive(Clone, Debug)]
pub struct DockConfig {
    pub linked: bool,
    pub chat_fraction: f64,
    pub monitor_index: usize,
    pub channels: Vec<String>,
    pub layout: String,
    pub reserve_chat: bool,
    /// Relative column widths (sum normalized). Empty = equal.
    pub col_weights: Vec<f64>,
    /// Relative row heights (sum normalized). Empty = equal.
    pub row_weights: Vec<f64>,
    /// 3plus1/2plus1: fraction of video along the main split axis.
    pub main_frac: f64,
    /// 3plus1/2plus1: relative sizes of the stacked panes.
    pub stack_weights: [f64; 3],
    /// Where the large pane sits: left|right|top|bottom.
    pub main_side: String,
}

impl Default for DockConfig {
    fn default() -> Self {
        Self {
            linked: true,
            chat_fraction: DEFAULT_CHAT_FRACTION,
            monitor_index: 0,
            channels: Vec::new(),
            layout: "2x2".into(),
            reserve_chat: false,
            col_weights: Vec::new(),
            row_weights: Vec::new(),
            main_frac: 2.0 / 3.0,
            stack_weights: [1.0, 1.0, 1.0],
            main_side: "left".into(),
        }
    }
}

fn dock() -> &'static Mutex<DockConfig> {
    static D: OnceLock<Mutex<DockConfig>> = OnceLock::new();
    D.get_or_init(|| Mutex::new(DockConfig::default()))
}

static APPLY_LAYOUT: OnceLock<Mutex<Option<fn()>>> = OnceLock::new();
static FRACTION_EMIT: OnceLock<Mutex<Option<fn(f64)>>> = OnceLock::new();
static GRIP_THREAD_STARTED: AtomicBool = AtomicBool::new(false);
/// After a monitor change, ask apply to raise mpv + chat to the foreground.
static RAISE_AFTER_APPLY: AtomicBool = AtomicBool::new(false);

pub fn take_raise_after_apply() -> bool {
    RAISE_AFTER_APPLY.swap(false, Ordering::SeqCst)
}

fn request_raise_after_apply() {
    RAISE_AFTER_APPLY.store(true, Ordering::SeqCst);
}

pub fn register_apply_layout(f: fn()) {
    *APPLY_LAYOUT
        .get_or_init(|| Mutex::new(None))
        .lock()
        .unwrap_or_else(|e| e.into_inner()) = Some(f);
}

pub fn register_fraction_emit(f: fn(f64)) {
    *FRACTION_EMIT
        .get_or_init(|| Mutex::new(None))
        .lock()
        .unwrap_or_else(|e| e.into_inner()) = Some(f);
}

/// Start the Windows grip/hotkey thread (idempotent). Call once from app setup.
pub fn start_background() {
    ensure_grip_thread();
}

fn run_apply() {
    if let Ok(guard) = APPLY_LAYOUT.get_or_init(|| Mutex::new(None)).lock() {
        if let Some(f) = *guard {
            f();
        }
    }
}

fn emit_fraction(f: f64) {
    if let Ok(guard) = FRACTION_EMIT.get_or_init(|| Mutex::new(None)).lock() {
        if let Some(cb) = *guard {
            cb(f);
        }
    }
}

pub fn clamp_chat_fraction(f: f64) -> f64 {
    f.clamp(MIN_CHAT_FRACTION, MAX_CHAT_FRACTION)
}

pub fn snapshot() -> DockConfig {
    dock().lock().map(|g| g.clone()).unwrap_or_default()
}

pub fn set_linked(enabled: bool) {
    if let Ok(mut g) = dock().lock() {
        g.linked = enabled;
    }
    ensure_grip_thread();
    #[cfg(windows)]
    post_cmd(DockCmd::Sync);
    #[cfg(not(windows))]
    let _ = enabled;
    run_apply();
}

pub fn set_chat_fraction(f: f64) {
    let f = clamp_chat_fraction(f);
    if let Ok(mut g) = dock().lock() {
        g.chat_fraction = f;
    }
    emit_fraction(f);
    run_apply();
    #[cfg(windows)]
    post_cmd(DockCmd::Sync);
}

pub fn chat_fraction() -> f64 {
    dock()
        .lock()
        .map(|g| clamp_chat_fraction(g.chat_fraction))
        .unwrap_or(DEFAULT_CHAT_FRACTION)
}

/// Update where the large pane sits for 2+1 / 3+1. Does not retile by itself —
/// call `run_apply` / `layout_watching` after.
pub fn set_main_side(side: &str) {
    let side = match side {
        "right" | "top" | "bottom" => side,
        _ => "left",
    };
    if let Ok(mut g) = dock().lock() {
        if g.main_side == side {
            return;
        }
        g.main_side = side.to_string();
        g.main_frac = 2.0 / 3.0;
        g.stack_weights = [1.0, 1.0, 1.0];
    }
}

/// Show Windows-style monitor numbers and pick one (replaces drag-to-move).
pub fn open_monitor_picker() {
    #[cfg(windows)]
    post_cmd(DockCmd::PickMonitor);
}

pub fn sync_session(channels: &[String], layout: &str, reserve_chat: bool, linked: bool) {
    let layout_changed = dock().lock().map(|g| g.layout != layout).unwrap_or(true);
    if let Ok(mut g) = dock().lock() {
        g.channels = channels.to_vec();
        if layout_changed {
            g.layout = layout.to_string();
            g.col_weights.clear();
            g.row_weights.clear();
            g.main_frac = 2.0 / 3.0;
            g.stack_weights = [1.0, 1.0, 1.0];
        }
        g.reserve_chat = reserve_chat;
        g.linked = linked;
    }
    ensure_grip_thread();
    #[cfg(windows)]
    post_cmd(DockCmd::Sync);
}

pub fn clear_session() {
    if let Ok(mut g) = dock().lock() {
        g.channels.clear();
    }
    #[cfg(windows)]
    post_cmd(DockCmd::Sync);
}

pub fn cycle_monitor() {
    // Prefer the identify-style picker over silent cycling.
    open_monitor_picker();
}

#[allow(dead_code)]
pub fn cycle_monitor_by(delta: i32) {
    #[cfg(windows)]
    {
        let n = list_monitor_work().len() as i32;
        if n <= 0 {
            return;
        }
        if let Ok(mut g) = dock().lock() {
            let cur = g.monitor_index as i32;
            let next = (cur + delta).rem_euclid(n) as usize;
            g.monitor_index = next;
        }
        request_raise_after_apply();
        run_apply();
        post_cmd(DockCmd::Sync);
    }
    #[cfg(not(windows))]
    {
        let _ = delta;
    }
}

pub fn active_work_rect() -> Option<Rect> {
    #[cfg(windows)]
    {
        let monitors = list_monitor_work();
        if monitors.is_empty() {
            return primary_work();
        }
        let idx = dock()
            .lock()
            .map(|g| g.monitor_index.min(monitors.len() - 1))
            .unwrap_or(0);
        Some(monitors[idx])
    }
    #[cfg(not(windows))]
    {
        None
    }
}

/// Split active work area into video (left) + optional chat (right).
pub fn chat_video_split(reserve_chat: bool) -> Option<(Rect, Option<Rect>)> {
    let work = active_work_rect()?;
    if !reserve_chat {
        return Some((work, None));
    }
    let frac = chat_fraction();
    let chat_w = ((work.width() as f64) * frac).round() as i32;
    let chat = Rect {
        left: work.right - chat_w,
        top: work.top,
        right: work.right,
        bottom: work.bottom,
    };
    let video = Rect {
        left: work.left,
        top: work.top,
        right: chat.left,
        bottom: work.bottom,
    };
    Some((video, Some(chat)))
}

fn normalize_weights(weights: &[f64], n: usize) -> Vec<f64> {
    if n == 0 {
        return Vec::new();
    }
    let mut w = if weights.len() == n && weights.iter().all(|x| *x > 0.0) {
        weights.to_vec()
    } else {
        vec![1.0; n]
    };
    let sum: f64 = w.iter().sum();
    if sum <= 0.0 {
        w = vec![1.0; n];
        let s = n as f64;
        for x in &mut w {
            *x /= s;
        }
    } else {
        for x in &mut w {
            *x /= sum;
        }
    }
    w
}

pub fn tile_rect(video: Rect, index: usize, layout: &str) -> Rect {
    let cfg = snapshot();
    let vw = video.width();
    let vh = video.height();
    if layout == "3plus1" || layout == "2plus1" {
        let stack_n = if layout == "2plus1" { 2 } else { 3 };
        let main_frac = cfg.main_frac.clamp(0.4, 0.85);
        let side = cfg.main_side.as_str();
        if side == "top" || side == "bottom" {
            let main_h = ((vh as f64) * main_frac).round() as i32;
            let stack = normalize_weights(&cfg.stack_weights[..stack_n], stack_n);
            if index == 0 {
                return if side == "top" {
                    Rect {
                        left: video.left,
                        top: video.top,
                        right: video.right,
                        bottom: video.top + main_h,
                    }
                } else {
                    Rect {
                        left: video.left,
                        top: video.bottom - main_h,
                        right: video.right,
                        bottom: video.bottom,
                    }
                };
            }
            let stack_top = if side == "top" {
                video.top + main_h
            } else {
                video.top
            };
            let stack_bottom = if side == "top" {
                video.bottom
            } else {
                video.bottom - main_h
            };
            let stack_h = (stack_bottom - stack_top).max(1);
            let slot = (index - 1).min(stack_n - 1);
            let mut x = video.left;
            for (i, w) in stack.iter().enumerate() {
                let cw = if i + 1 == stack_n {
                    video.right - x
                } else {
                    ((vw as f64) * w).round() as i32
                };
                if i == slot {
                    return Rect {
                        left: x,
                        top: stack_top,
                        right: x + cw.max(1),
                        bottom: stack_top + stack_h,
                    };
                }
                x += cw;
            }
            return Rect {
                left: video.left,
                top: stack_top,
                right: video.right,
                bottom: stack_bottom,
            };
        }
        // left / right
        let main_w = ((vw as f64) * main_frac).round() as i32;
        let stack = normalize_weights(&cfg.stack_weights[..stack_n], stack_n);
        if index == 0 {
            return if side == "right" {
                Rect {
                    left: video.right - main_w,
                    top: video.top,
                    right: video.right,
                    bottom: video.bottom,
                }
            } else {
                Rect {
                    left: video.left,
                    top: video.top,
                    right: video.left + main_w,
                    bottom: video.bottom,
                }
            };
        }
        let stack_left = if side == "right" {
            video.left
        } else {
            video.left + main_w
        };
        let stack_right = if side == "right" {
            video.right - main_w
        } else {
            video.right
        };
        let slot = (index - 1).min(stack_n - 1);
        let mut y = video.top;
        for (i, w) in stack.iter().enumerate() {
            let h = if i + 1 == stack_n {
                video.bottom - y
            } else {
                ((vh as f64) * w).round() as i32
            };
            if i == slot {
                return Rect {
                    left: stack_left,
                    top: y,
                    right: stack_right,
                    bottom: y + h.max(1),
                };
            }
            y += h;
        }
        return Rect {
            left: stack_left,
            top: video.top,
            right: stack_right,
            bottom: video.bottom,
        };
    }
    let (cols, rows) = match layout {
        "1" => (1, 1),
        "2" => (2, 1),
        "2x2" => (2, 2),
        "3x2" => (3, 2),
        "4x2" => (4, 2),
        "8x1" => (8, 1),
        _ => (2, 2),
    };
    let max_i = (cols * rows).max(1) - 1;
    let i = index.min(max_i);
    let col = i % cols;
    let row = i / cols;
    let col_w = normalize_weights(&cfg.col_weights, cols);
    let row_w = normalize_weights(&cfg.row_weights, rows);
    let mut x = video.left;
    for (c, w) in col_w.iter().enumerate() {
        let cw = if c == cols - 1 {
            video.right - x
        } else {
            ((vw as f64) * w).round() as i32
        };
        if c == col {
            let mut y = video.top;
            for (r, rw) in row_w.iter().enumerate() {
                let rh = if r == rows - 1 {
                    video.bottom - y
                } else {
                    ((vh as f64) * rw).round() as i32
                };
                if r == row {
                    return Rect {
                        left: x,
                        top: y,
                        right: x + cw.max(1),
                        bottom: y + rh.max(1),
                    };
                }
                y += rh;
            }
        }
        x += cw;
    }
    video
}

fn ensure_grip_thread() {
    #[cfg(windows)]
    {
        if GRIP_THREAD_STARTED.swap(true, Ordering::SeqCst) {
            return;
        }
        thread::spawn(grip_thread_main);
    }
    #[cfg(not(windows))]
    {
        let _ = &GRIP_THREAD_STARTED;
    }
}

#[cfg(windows)]
#[derive(Clone)]
enum DockCmd {
    Sync,
    /// Hide all grip HWNDs (dock minimized).
    HideGrips,
    /// Hide only the video|chat seam grips so Chatterino popups aren't clipped.
    SuppressSeam,
    /// Re-show seam grips after a Chatterino popup closes (no full rebuild).
    RestoreSeam,
    /// Lift grips above mpv/chat without making them global TOPMOST.
    RaiseGrips,
    /// Show Windows-style monitor numbers; click to pick.
    PickMonitor,
}

#[cfg(windows)]
fn cmd_queue() -> &'static Mutex<Vec<DockCmd>> {
    static Q: OnceLock<Mutex<Vec<DockCmd>>> = OnceLock::new();
    Q.get_or_init(|| Mutex::new(Vec::new()))
}

#[cfg(windows)]
fn post_cmd(cmd: DockCmd) {
    ensure_grip_thread();
    if let Ok(mut q) = cmd_queue().lock() {
        q.push(cmd);
    }
}

#[cfg(windows)]
static GRIPS_GROUP_MINIMIZED: AtomicBool = AtomicBool::new(false);

/// Hide dock grips while the player/chat group is minimized.
pub fn hide_grips() {
    #[cfg(windows)]
    {
        GRIPS_GROUP_MINIMIZED.store(true, Ordering::SeqCst);
        post_cmd(DockCmd::HideGrips);
    }
}

/// Re-show / rebuild grips after restore.
pub fn show_grips() {
    #[cfg(windows)]
    {
        GRIPS_GROUP_MINIMIZED.store(false, Ordering::SeqCst);
        post_cmd(DockCmd::Sync);
    }
}

/// Keep grips above the dock players without WS_EX_TOPMOST (so other apps
/// can cover the whole dock including the grey borders).
pub fn raise_grips() {
    #[cfg(windows)]
    {
        if GRIPS_GROUP_MINIMIZED.load(Ordering::SeqCst) {
            return;
        }
        post_cmd(DockCmd::RaiseGrips);
    }
}

/// True when `hwnd` is one of our dock grip windows (class `StguiDockGrip`).
#[cfg(windows)]
pub fn is_grip_hwnd(hwnd: *mut core::ffi::c_void) -> bool {
    if hwnd.is_null() {
        return false;
    }
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetClassNameW(hwnd: *mut core::ffi::c_void, buf: *mut u16, n: i32) -> i32;
    }
    let mut buf = [0u16; 64];
    let n = unsafe { GetClassNameW(hwnd, buf.as_mut_ptr(), buf.len() as i32) };
    if n <= 0 {
        return false;
    }
    let class = String::from_utf16_lossy(&buf[..n as usize]);
    class == "StguiDockGrip"
}

#[cfg(not(windows))]
pub fn is_grip_hwnd(_hwnd: *mut core::ffi::c_void) -> bool {
    false
}

/// Temporarily hide the chat/move seam grips (Chatterino usercard, etc.).
pub fn suppress_seam_grips() {
    #[cfg(windows)]
    post_cmd(DockCmd::SuppressSeam);
}

/// Put seam grips back without rebuilding tile grips.
pub fn restore_seam_grips() {
    #[cfg(windows)]
    post_cmd(DockCmd::RestoreSeam);
}

#[cfg(windows)]
#[derive(Clone, Copy, Debug)]
struct MonitorGeom {
    work: Rect,
    /// Full monitor bounds (incl. taskbar) — use for drag hit-testing.
    full: Rect,
    display_num: u32,
    primary: bool,
}

#[cfg(windows)]
fn parse_display_num(sz_device: &[u16; 32]) -> u32 {
    let name = String::from_utf16_lossy(sz_device);
    let name = name.trim_end_matches('\0');
    // `\\.\DISPLAY1` / `\\.\DISPLAY12`
    name.rsplit(|c: char| !c.is_ascii_digit())
        .find(|s| !s.is_empty())
        .and_then(|s| s.parse().ok())
        .unwrap_or(999)
}

#[cfg(windows)]
fn list_monitors() -> Vec<MonitorGeom> {
    use std::sync::Mutex as StdMutex;
    struct Acc {
        list: StdMutex<Vec<MonitorGeom>>,
    }
    #[link(name = "user32")]
    unsafe extern "system" {
        fn EnumDisplayMonitors(
            hdc: *mut core::ffi::c_void,
            clip: *const Rect,
            cb: unsafe extern "system" fn(
                *mut core::ffi::c_void,
                *mut core::ffi::c_void,
                *mut Rect,
                isize,
            ) -> i32,
            data: isize,
        ) -> i32;
        fn GetMonitorInfoW(monitor: *mut core::ffi::c_void, info: *mut MonitorInfoEx) -> i32;
        fn SetThreadDpiAwarenessContext(context: isize) -> isize;
    }
    #[repr(C)]
    struct MonitorInfoEx {
        cb_size: u32,
        rc_monitor: Rect,
        rc_work: Rect,
        dw_flags: u32,
        sz_device: [u16; 32],
    }
    const MONITORINFOF_PRIMARY: u32 = 1;
    unsafe extern "system" fn enum_cb(
        monitor: *mut core::ffi::c_void,
        _hdc: *mut core::ffi::c_void,
        _rect: *mut Rect,
        data: isize,
    ) -> i32 {
        let acc = &*(data as *const Acc);
        let mut info = MonitorInfoEx {
            cb_size: std::mem::size_of::<MonitorInfoEx>() as u32,
            rc_monitor: Rect::default(),
            rc_work: Rect::default(),
            dw_flags: 0,
            sz_device: [0; 32],
        };
        if GetMonitorInfoW(monitor, &mut info) != 0 {
            if let Ok(mut list) = acc.list.lock() {
                list.push(MonitorGeom {
                    work: info.rc_work,
                    full: info.rc_monitor,
                    display_num: parse_display_num(&info.sz_device),
                    primary: info.dw_flags & MONITORINFOF_PRIMARY != 0,
                });
            }
        }
        1
    }
    unsafe {
        let _ = SetThreadDpiAwarenessContext(-4);
    }
    let acc = Acc {
        list: StdMutex::new(Vec::new()),
    };
    unsafe {
        EnumDisplayMonitors(
            std::ptr::null_mut(),
            std::ptr::null(),
            enum_cb,
            &acc as *const Acc as isize,
        );
    }
    let mut list = acc.list.into_inner().unwrap_or_default();
    // Match Windows Display Settings numbering (DISPLAY1, DISPLAY2, …).
    list.sort_by(|a, b| {
        a.display_num
            .cmp(&b.display_num)
            .then_with(|| a.full.left.cmp(&b.full.left))
            .then_with(|| a.full.top.cmp(&b.full.top))
    });
    list
}

#[cfg(windows)]
fn list_monitor_work() -> Vec<Rect> {
    list_monitors().into_iter().map(|m| m.work).collect()
}

#[cfg(windows)]
fn primary_work() -> Option<Rect> {
    let list = list_monitors();
    list.iter()
        .find(|m| m.primary)
        .or_else(|| list.first())
        .map(|m| m.work)
}

#[cfg(windows)]
#[allow(dead_code)]
fn monitor_index_at(x: i32, y: i32) -> Option<usize> {
    let list = list_monitors();
    // Prefer full bounds so dragging across taskbar / bezel gaps still hits.
    list.iter()
        .position(|m| x >= m.full.left && x < m.full.right && y >= m.full.top && y < m.full.bottom)
        .or_else(|| {
            list.iter().position(|m| {
                x >= m.work.left && x < m.work.right && y >= m.work.top && y < m.work.bottom
            })
        })
}

#[cfg(windows)]
struct GripWindows {
    chat: *mut core::ffi::c_void,
    /// Center ◀ ▶ handle — click to pick a monitor (identify overlays).
    mover: *mut core::ffi::c_void,
    tiles: Vec<*mut core::ffi::c_void>,
    /// Temporary Windows-style monitor number overlays.
    identifies: Vec<*mut core::ffi::c_void>,
}

#[cfg(windows)]
unsafe impl Send for GripWindows {}

#[cfg(windows)]
fn grip_thread_main() {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn RegisterClassExW(c: *const WndClassEx) -> u16;
        fn CreateWindowExW(
            ex: u32,
            class: *const u16,
            name: *const u16,
            style: u32,
            x: i32,
            y: i32,
            w: i32,
            h: i32,
            parent: *mut core::ffi::c_void,
            menu: *mut core::ffi::c_void,
            instance: *mut core::ffi::c_void,
            param: *mut core::ffi::c_void,
        ) -> *mut core::ffi::c_void;
        fn DestroyWindow(hwnd: *mut core::ffi::c_void) -> i32;
        fn ShowWindow(hwnd: *mut core::ffi::c_void, cmd: i32) -> i32;
        fn SetWindowPos(
            hwnd: *mut core::ffi::c_void,
            after: *mut core::ffi::c_void,
            x: i32,
            y: i32,
            cx: i32,
            cy: i32,
            flags: u32,
        ) -> i32;
        fn TranslateMessage(msg: *const Msg) -> i32;
        fn DispatchMessageW(msg: *const Msg) -> isize;
        fn DefWindowProcW(hwnd: *mut core::ffi::c_void, msg: u32, w: usize, l: isize) -> isize;
        fn SetCapture(hwnd: *mut core::ffi::c_void) -> *mut core::ffi::c_void;
        fn ReleaseCapture() -> i32;
        fn GetCursorPos(pt: *mut Point) -> i32;
        fn LoadCursorW(instance: *mut core::ffi::c_void, name: usize) -> *mut core::ffi::c_void;
        fn SetCursor(cursor: *mut core::ffi::c_void) -> *mut core::ffi::c_void;
        fn FillRect(
            hdc: *mut core::ffi::c_void,
            rect: *const Rect,
            brush: *mut core::ffi::c_void,
        ) -> i32;
        fn BeginPaint(hwnd: *mut core::ffi::c_void, ps: *mut PaintStruct)
            -> *mut core::ffi::c_void;
        fn EndPaint(hwnd: *mut core::ffi::c_void, ps: *const PaintStruct) -> i32;
        fn GetClientRect(hwnd: *mut core::ffi::c_void, rect: *mut Rect) -> i32;
        fn CreateSolidBrush(color: u32) -> *mut core::ffi::c_void;
        fn DeleteObject(obj: *mut core::ffi::c_void) -> i32;
        fn SetWindowLongPtrW(hwnd: *mut core::ffi::c_void, index: i32, value: isize) -> isize;
        fn GetWindowLongPtrW(hwnd: *mut core::ffi::c_void, index: i32) -> isize;
        fn PeekMessageW(
            msg: *mut Msg,
            hwnd: *mut core::ffi::c_void,
            min: u32,
            max: u32,
            remove: u32,
        ) -> i32;
        fn SetLayeredWindowAttributes(
            hwnd: *mut core::ffi::c_void,
            key: u32,
            alpha: u8,
            flags: u32,
        ) -> i32;
        fn TrackMouseEvent(tme: *mut TrackMouseEvent) -> i32;
        fn InvalidateRect(hwnd: *mut core::ffi::c_void, rect: *const Rect, erase: i32) -> i32;
        fn SetTextColor(hdc: *mut core::ffi::c_void, color: u32) -> u32;
        fn SetBkMode(hdc: *mut core::ffi::c_void, mode: i32) -> i32;
        fn DrawTextW(
            hdc: *mut core::ffi::c_void,
            text: *const u16,
            count: i32,
            rect: *mut Rect,
            format: u32,
        ) -> i32;
        fn RegisterHotKey(hwnd: *mut core::ffi::c_void, id: i32, modifiers: u32, vk: u32) -> i32;
        fn GetAsyncKeyState(vk: i32) -> i16;
    }
    #[link(name = "gdi32")]
    unsafe extern "system" {
        fn CreateFontW(
            height: i32,
            width: i32,
            escapement: i32,
            orientation: i32,
            weight: i32,
            italic: u32,
            underline: u32,
            strike_out: u32,
            char_set: u32,
            out_precision: u32,
            clip_precision: u32,
            quality: u32,
            pitch_and_family: u32,
            face: *const u16,
        ) -> *mut core::ffi::c_void;
        fn SelectObject(
            hdc: *mut core::ffi::c_void,
            obj: *mut core::ffi::c_void,
        ) -> *mut core::ffi::c_void;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetModuleHandleW(name: *const u16) -> *mut core::ffi::c_void;
    }

    #[repr(C)]
    struct TrackMouseEvent {
        cb_size: u32,
        dw_flags: u32,
        hwnd: *mut core::ffi::c_void,
        hover_time: u32,
    }

    #[repr(C)]
    struct Point {
        x: i32,
        y: i32,
    }
    #[repr(C)]
    struct Msg {
        hwnd: *mut core::ffi::c_void,
        message: u32,
        wparam: usize,
        lparam: isize,
        time: u32,
        pt: Point,
    }
    #[repr(C)]
    struct PaintStruct {
        hdc: *mut core::ffi::c_void,
        erase: i32,
        rc: Rect,
        restore: i32,
        inc_update: i32,
        rgb: [u8; 32],
    }
    #[repr(C)]
    struct WndClassEx {
        cb_size: u32,
        style: u32,
        wnd_proc:
            Option<unsafe extern "system" fn(*mut core::ffi::c_void, u32, usize, isize) -> isize>,
        cls_extra: i32,
        wnd_extra: i32,
        instance: *mut core::ffi::c_void,
        icon: *mut core::ffi::c_void,
        cursor: *mut core::ffi::c_void,
        background: *mut core::ffi::c_void,
        menu_name: *const u16,
        class_name: *const u16,
        icon_sm: *mut core::ffi::c_void,
    }

    const WM_PAINT: u32 = 0x000F;
    const WM_DESTROY: u32 = 0x0002;
    const WM_LBUTTONDOWN: u32 = 0x0201;
    const WM_LBUTTONUP: u32 = 0x0202;
    const WM_MOUSEMOVE: u32 = 0x0200;
    const WM_MOUSELEAVE: u32 = 0x02A3;
    const WM_SETCURSOR: u32 = 0x0020;
    const WM_HOTKEY: u32 = 0x0312;
    const WS_POPUP: u32 = 0x8000_0000;
    const WS_VISIBLE: u32 = 0x1000_0000;
    // Stay above mpv/chat via RaiseGrips / HWND_TOP — never WS_EX_TOPMOST, or
    // the grey bars cover every other application.
    const WS_EX_TOOLWINDOW: u32 = 0x0000_0080;
    const WS_EX_NOACTIVATE: u32 = 0x0800_0000;
    const WS_EX_LAYERED: u32 = 0x0008_0000;
    /// Only monitor-number overlays use TOPMOST (brief picker UX).
    const WS_EX_TOPMOST: u32 = 0x0000_0008;
    const HWND_TOP: isize = 0;
    const HWND_NOTOPMOST: isize = -2;
    const SWP_NOACTIVATE: u32 = 0x0010;
    const SWP_SHOWWINDOW: u32 = 0x0040;
    const SWP_NOMOVE: u32 = 0x0002;
    const SWP_NOSIZE: u32 = 0x0001;
    const SWP_NOZORDER: u32 = 0x0004;
    const SW_SHOWNOACTIVATE: i32 = 4;
    const IDC_SIZEWE: usize = 32644;
    const IDC_SIZENS: usize = 32645;
    const IDC_HAND: usize = 32649;
    const GWLP_USERDATA: i32 = -21;
    const PM_REMOVE: u32 = 0x0001;
    const LWA_ALPHA: u32 = 0x0000_0002;
    const TME_LEAVE: u32 = 0x0000_0002;
    const DT_CENTER: u32 = 0x0000_0001;
    const DT_VCENTER: u32 = 0x0000_0004;
    const DT_SINGLELINE: u32 = 0x0000_0020;
    const TRANSPARENT: i32 = 1;
    const MOD_CONTROL: u32 = 0x0002;
    const MOD_SHIFT: u32 = 0x0004;
    const MOD_NOREPEAT: u32 = 0x4000;
    const HOTKEY_CYCLE: i32 = 1;
    const VK_M: u32 = 0x4D;
    const VK_ESCAPE: i32 = 0x1B;
    const FW_BOLD: i32 = 700;
    /// ~15% visible at rest, ~55% on hover (user asked ~85% transparent).
    const ALPHA_REST: u8 = 38;
    const ALPHA_HOVER: u8 = 140;
    const ALPHA_IDENTIFY: u8 = 210;

    #[derive(Clone, Copy)]
    enum GripKind {
        Chat,
        Move,
        Col(usize),
        Row(usize),
        Main,
        Stack(usize),
        Identify(usize),
    }

    struct DragState {
        kind: GripKind,
        start_x: i32,
        start_y: i32,
        #[allow(dead_code)]
        start_frac: f64,
        #[allow(dead_code)]
        start_main: f64,
        start_cols: Vec<f64>,
        start_rows: Vec<f64>,
        start_stack: [f64; 3],
        #[allow(dead_code)]
        start_monitor: usize,
        moved: bool,
    }

    static DRAG: OnceLock<Mutex<Option<DragState>>> = OnceLock::new();
    static MOVER_HOVER: AtomicBool = AtomicBool::new(false);
    static PICKER_OPEN: AtomicBool = AtomicBool::new(false);
    fn drag() -> &'static Mutex<Option<DragState>> {
        DRAG.get_or_init(|| Mutex::new(None))
    }

    unsafe extern "system" fn wnd_proc(
        hwnd: *mut core::ffi::c_void,
        msg: u32,
        wparam: usize,
        lparam: isize,
    ) -> isize {
        let kind_raw = GetWindowLongPtrW(hwnd, GWLP_USERDATA);
        let kind = match kind_raw {
            1 => GripKind::Chat,
            2 => GripKind::Main,
            10 => GripKind::Move,
            n if (100..200).contains(&n) => GripKind::Col((n - 100) as usize),
            n if (200..300).contains(&n) => GripKind::Row((n - 200) as usize),
            n if (300..400).contains(&n) => GripKind::Stack((n - 300) as usize),
            n if (1000..1100).contains(&n) => GripKind::Identify((n - 1000) as usize),
            _ => GripKind::Chat,
        };
        match msg {
            WM_PAINT => {
                let mut ps = std::mem::zeroed::<PaintStruct>();
                let hdc = BeginPaint(hwnd, &mut ps);
                let mut rc = Rect::default();
                GetClientRect(hwnd, &mut rc);
                if matches!(kind, GripKind::Move) {
                    let hover = MOVER_HOVER.load(Ordering::Relaxed);
                    let brush = CreateSolidBrush(if hover { 0x00_60_60_70 } else { 0x00_40_40_48 });
                    FillRect(hdc, &rc, brush);
                    DeleteObject(brush);
                    SetBkMode(hdc, TRANSPARENT);
                    SetTextColor(hdc, if hover { 0x00_FF_FF_FF } else { 0x00_DD_DD_DD });
                    let label = wide("◀  ▶");
                    DrawTextW(
                        hdc,
                        label.as_ptr(),
                        -1,
                        &mut rc,
                        DT_CENTER | DT_VCENTER | DT_SINGLELINE,
                    );
                } else if let GripKind::Identify(idx) = kind {
                    let brush = CreateSolidBrush(0x00_20_20_28);
                    FillRect(hdc, &rc, brush);
                    DeleteObject(brush);
                    SetBkMode(hdc, TRANSPARENT);
                    SetTextColor(hdc, 0x00_FF_FF_FF);
                    let face = wide("Segoe UI");
                    let font = CreateFontW(
                        -((rc.height() as f64) * 0.55).round() as i32,
                        0,
                        0,
                        0,
                        FW_BOLD,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        face.as_ptr(),
                    );
                    let old = if !font.is_null() {
                        SelectObject(hdc, font)
                    } else {
                        std::ptr::null_mut()
                    };
                    let label = wide(&format!("{}", idx + 1));
                    DrawTextW(
                        hdc,
                        label.as_ptr(),
                        -1,
                        &mut rc,
                        DT_CENTER | DT_VCENTER | DT_SINGLELINE,
                    );
                    if !font.is_null() {
                        SelectObject(hdc, old);
                        DeleteObject(font);
                    }
                } else {
                    let brush = CreateSolidBrush(0x00_88_88_88);
                    FillRect(hdc, &rc, brush);
                    DeleteObject(brush);
                }
                EndPaint(hwnd, &ps);
                0
            }
            WM_SETCURSOR => {
                let side = snapshot().main_side;
                let cursor_id = match kind {
                    GripKind::Move | GripKind::Identify(_) => IDC_HAND,
                    GripKind::Chat | GripKind::Col(_) => IDC_SIZEWE,
                    GripKind::Row(_) => IDC_SIZENS,
                    GripKind::Main => {
                        if side == "top" || side == "bottom" {
                            IDC_SIZENS
                        } else {
                            IDC_SIZEWE
                        }
                    }
                    GripKind::Stack(_) => {
                        if side == "top" || side == "bottom" {
                            IDC_SIZEWE
                        } else {
                            IDC_SIZENS
                        }
                    }
                };
                let cur = LoadCursorW(std::ptr::null_mut(), cursor_id);
                SetCursor(cur);
                1
            }
            WM_MOUSEMOVE
                if matches!(kind, GripKind::Move)
                    && drag().lock().map(|g| g.is_none()).unwrap_or(true) =>
            {
                if !MOVER_HOVER.swap(true, Ordering::Relaxed) {
                    SetLayeredWindowAttributes(hwnd, 0, ALPHA_HOVER, LWA_ALPHA);
                    InvalidateRect(hwnd, std::ptr::null(), 1);
                }
                let mut tme = TrackMouseEvent {
                    cb_size: std::mem::size_of::<TrackMouseEvent>() as u32,
                    dw_flags: TME_LEAVE,
                    hwnd,
                    hover_time: 0,
                };
                TrackMouseEvent(&mut tme);
                0
            }
            WM_MOUSELEAVE if matches!(kind, GripKind::Move) => {
                MOVER_HOVER.store(false, Ordering::Relaxed);
                SetLayeredWindowAttributes(hwnd, 0, ALPHA_REST, LWA_ALPHA);
                InvalidateRect(hwnd, std::ptr::null(), 1);
                0
            }
            WM_LBUTTONDOWN => {
                if matches!(kind, GripKind::Move) {
                    post_cmd(DockCmd::PickMonitor);
                    return 0;
                }
                if let GripKind::Identify(idx) = kind {
                    dismiss_monitor_picker();
                    if let Ok(mut g) = dock().lock() {
                        g.monitor_index = idx;
                    }
                    request_raise_after_apply();
                    run_apply();
                    post_cmd(DockCmd::Sync);
                    return 0;
                }
                let mut pt = Point { x: 0, y: 0 };
                GetCursorPos(&mut pt);
                let cfg = snapshot();
                *drag().lock().unwrap_or_else(|e| e.into_inner()) = Some(DragState {
                    kind,
                    start_x: pt.x,
                    start_y: pt.y,
                    start_frac: cfg.chat_fraction,
                    start_main: cfg.main_frac,
                    start_cols: cfg.col_weights.clone(),
                    start_rows: cfg.row_weights.clone(),
                    start_stack: cfg.stack_weights,
                    start_monitor: cfg.monitor_index,
                    moved: false,
                });
                SetCapture(hwnd);
                0
            }
            WM_MOUSEMOVE => {
                let mut pt = Point { x: 0, y: 0 };
                GetCursorPos(&mut pt);
                let mut guard = drag().lock().unwrap_or_else(|e| e.into_inner());
                let Some(d) = guard.as_mut() else {
                    return DefWindowProcW(hwnd, msg, wparam, lparam);
                };
                if (pt.x - d.start_x).abs() > 4 || (pt.y - d.start_y).abs() > 4 {
                    d.moved = true;
                }
                let work = active_work_rect().unwrap_or(Rect {
                    left: 0,
                    top: 0,
                    right: 1920,
                    bottom: 1080,
                });
                match d.kind {
                    GripKind::Move | GripKind::Identify(_) => 0,
                    GripKind::Chat => {
                        let w = work.width().max(1) as f64;
                        let chat_w = (work.right - pt.x).max(0) as f64;
                        let frac = clamp_chat_fraction(chat_w / w);
                        drop(guard);
                        if let Ok(mut g) = dock().lock() {
                            g.chat_fraction = frac;
                        }
                        emit_fraction(frac);
                        run_apply();
                        reposition_all_grips_static();
                        return 0;
                    }
                    GripKind::Main => {
                        let video = chat_video_split(snapshot().reserve_chat)
                            .map(|(v, _)| v)
                            .unwrap_or(work);
                        let side = snapshot().main_side;
                        let main = match side.as_str() {
                            "top" => {
                                let h = video.height().max(1) as f64;
                                ((pt.y - video.top) as f64 / h).clamp(0.4, 0.85)
                            }
                            "bottom" => {
                                let h = video.height().max(1) as f64;
                                ((video.bottom - pt.y) as f64 / h).clamp(0.4, 0.85)
                            }
                            "right" => {
                                let w = video.width().max(1) as f64;
                                ((video.right - pt.x) as f64 / w).clamp(0.4, 0.85)
                            }
                            _ => {
                                let w = video.width().max(1) as f64;
                                ((pt.x - video.left) as f64 / w).clamp(0.4, 0.85)
                            }
                        };
                        drop(guard);
                        if let Ok(mut g) = dock().lock() {
                            g.main_frac = main;
                        }
                        run_apply();
                        reposition_all_grips_static();
                        return 0;
                    }
                    GripKind::Col(seam) => {
                        let (cols, _) = grid_dims(&snapshot().layout);
                        if cols < 2 || seam + 1 >= cols {
                            return 0;
                        }
                        let video = chat_video_split(snapshot().reserve_chat)
                            .map(|(v, _)| v)
                            .unwrap_or(work);
                        let mut weights = normalize_weights(&d.start_cols, cols);
                        let left_edge = {
                            let mut x = video.left as f64;
                            for w in weights.iter().take(seam) {
                                x += video.width() as f64 * w;
                            }
                            x
                        };
                        let pair = weights[seam] + weights[seam + 1];
                        let local = ((pt.x as f64 - left_edge) / (video.width() as f64))
                            .clamp(0.05, pair - 0.05);
                        weights[seam] = local;
                        weights[seam + 1] = pair - local;
                        drop(guard);
                        if let Ok(mut g) = dock().lock() {
                            g.col_weights = weights;
                        }
                        run_apply();
                        reposition_all_grips_static();
                        return 0;
                    }
                    GripKind::Row(seam) => {
                        let (_, rows) = grid_dims(&snapshot().layout);
                        if rows < 2 || seam + 1 >= rows {
                            return 0;
                        }
                        let video = chat_video_split(snapshot().reserve_chat)
                            .map(|(v, _)| v)
                            .unwrap_or(work);
                        let mut weights = normalize_weights(&d.start_rows, rows);
                        let top_edge = {
                            let mut y = video.top as f64;
                            for w in weights.iter().take(seam) {
                                y += video.height() as f64 * w;
                            }
                            y
                        };
                        let pair = weights[seam] + weights[seam + 1];
                        let local = ((pt.y as f64 - top_edge) / (video.height() as f64))
                            .clamp(0.05, pair - 0.05);
                        weights[seam] = local;
                        weights[seam + 1] = pair - local;
                        drop(guard);
                        if let Ok(mut g) = dock().lock() {
                            g.row_weights = weights;
                        }
                        run_apply();
                        reposition_all_grips_static();
                        return 0;
                    }
                    GripKind::Stack(seam) => {
                        let cfg = snapshot();
                        let stack_n = if cfg.layout == "2plus1" { 2 } else { 3 };
                        if seam + 1 >= stack_n {
                            return 0;
                        }
                        let video = chat_video_split(cfg.reserve_chat)
                            .map(|(v, _)| v)
                            .unwrap_or(work);
                        let side = cfg.main_side.as_str();
                        let mut weights = normalize_weights(&d.start_stack[..stack_n], stack_n);
                        if side == "top" || side == "bottom" {
                            let stack_w = video.width().max(1) as f64;
                            let left_edge = {
                                let mut x = video.left as f64;
                                for w in weights.iter().take(seam) {
                                    x += stack_w * w;
                                }
                                x
                            };
                            let pair = weights[seam] + weights[seam + 1];
                            let local =
                                ((pt.x as f64 - left_edge) / stack_w).clamp(0.05, pair - 0.05);
                            weights[seam] = local;
                            weights[seam + 1] = pair - local;
                        } else {
                            let stack_h = video.height().max(1) as f64;
                            let top_edge = {
                                let mut y = video.top as f64;
                                for w in weights.iter().take(seam) {
                                    y += stack_h * w;
                                }
                                y
                            };
                            let pair = weights[seam] + weights[seam + 1];
                            let local =
                                ((pt.y as f64 - top_edge) / stack_h).clamp(0.05, pair - 0.05);
                            weights[seam] = local;
                            weights[seam + 1] = pair - local;
                        }
                        let mut arr = [1.0_f64, 1.0, 1.0];
                        for (i, w) in weights.iter().enumerate().take(3) {
                            arr[i] = *w;
                        }
                        drop(guard);
                        if let Ok(mut g) = dock().lock() {
                            g.stack_weights = arr;
                        }
                        run_apply();
                        reposition_all_grips_static();
                        return 0;
                    }
                }
            }
            WM_LBUTTONUP => {
                ReleaseCapture();
                let _ = drag().lock().unwrap_or_else(|e| e.into_inner()).take();
                post_cmd(DockCmd::Sync);
                0
            }
            WM_DESTROY => 0,
            _ => DefWindowProcW(hwnd, msg, wparam, lparam),
        }
    }

    fn grid_dims(layout: &str) -> (usize, usize) {
        match layout {
            "1" => (1, 1),
            "2" => (2, 1),
            "2x2" => (2, 2),
            "3x2" => (3, 2),
            "4x2" => (4, 2),
            "8x1" => (8, 1),
            "3plus1" => (2, 3),
            "2plus1" => (2, 2),
            _ => (2, 2),
        }
    }

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    // Grip HWNDs live in this thread only.
    static GRIPS: OnceLock<Mutex<GripWindows>> = OnceLock::new();
    fn grips() -> &'static Mutex<GripWindows> {
        GRIPS.get_or_init(|| {
            Mutex::new(GripWindows {
                chat: std::ptr::null_mut(),
                mover: std::ptr::null_mut(),
                tiles: Vec::new(),
                identifies: Vec::new(),
            })
        })
    }

    const SWP_HIDEWINDOW: u32 = 0x0080;

    unsafe fn destroy_grip(hwnd: *mut core::ffi::c_void) {
        if !hwnd.is_null() {
            DestroyWindow(hwnd);
        }
    }

    unsafe fn hide_grip(hwnd: *mut core::ffi::c_void) {
        if hwnd.is_null() {
            return;
        }
        // Park off-screen and hide without asserting TOPMOST.
        SetWindowPos(
            hwnd,
            std::ptr::null_mut(),
            -32000,
            -32000,
            1,
            1,
            SWP_NOACTIVATE | SWP_NOZORDER | SWP_HIDEWINDOW,
        );
        ShowWindow(hwnd, 0);
    }

    unsafe fn create_grip(
        instance: *mut core::ffi::c_void,
        class: *const u16,
        kind_code: isize,
    ) -> *mut core::ffi::c_void {
        let title = wide("");
        let is_mover = kind_code == 10;
        let is_identify = (1000..1100).contains(&kind_code);
        let layered = is_mover || is_identify;
        // Identify overlays briefly cover the desktop; regular grips must not.
        let ex = WS_EX_TOOLWINDOW
            | WS_EX_NOACTIVATE
            | if layered { WS_EX_LAYERED } else { 0 }
            | if is_identify { WS_EX_TOPMOST } else { 0 };
        let (w, h) = if is_identify {
            (220, 220)
        } else if is_mover {
            (88, 44)
        } else {
            (8, 8)
        };
        let hwnd = CreateWindowExW(
            ex,
            class,
            title.as_ptr(),
            WS_POPUP | WS_VISIBLE,
            0,
            0,
            w,
            h,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            instance,
            std::ptr::null_mut(),
        );
        if !hwnd.is_null() {
            SetWindowLongPtrW(hwnd, GWLP_USERDATA, kind_code);
            if is_mover {
                SetLayeredWindowAttributes(hwnd, 0, ALPHA_REST, LWA_ALPHA);
            } else if is_identify {
                SetLayeredWindowAttributes(hwnd, 0, ALPHA_IDENTIFY, LWA_ALPHA);
            }
            // Clear any inherited topmost bit on non-identify grips.
            if !is_identify {
                SetWindowPos(
                    hwnd,
                    HWND_NOTOPMOST as *mut core::ffi::c_void,
                    0,
                    0,
                    0,
                    0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
                );
            }
            ShowWindow(hwnd, SW_SHOWNOACTIVATE);
        }
        hwnd
    }

    fn mover_rect(video: Rect, chat_opt: Option<Rect>) -> Rect {
        const W: i32 = 88;
        const H: i32 = 44;
        let seam_x = chat_opt.map(|c| c.left).unwrap_or(video.right);
        let cx = seam_x;
        let cy = video.top + video.height() / 2;
        Rect {
            left: cx - W / 2,
            top: cy - H / 2,
            right: cx + W / 2,
            bottom: cy + H / 2,
        }
    }

    unsafe fn place_grip(hwnd: *mut core::ffi::c_void, r: Rect) {
        if hwnd.is_null() {
            return;
        }
        // Move/size only — z-order is handled by RaiseGrips when the dock is
        // focused, so we never pin bars above unrelated apps.
        SetWindowPos(
            hwnd,
            std::ptr::null_mut(),
            r.left,
            r.top,
            r.width().max(4),
            r.height().max(4),
            SWP_NOACTIVATE | SWP_NOZORDER | SWP_SHOWWINDOW,
        );
    }

    unsafe fn raise_grips_inner() {
        let Ok(g) = grips().lock() else {
            return;
        };
        let mut list = Vec::with_capacity(2 + g.tiles.len());
        if !g.chat.is_null() {
            list.push(g.chat);
        }
        for &h in &g.tiles {
            if !h.is_null() {
                list.push(h);
            }
        }
        // Mover last so it sits above seam/tile grips.
        if !g.mover.is_null() {
            list.push(g.mover);
        }
        for &hwnd in &list {
            SetWindowPos(
                hwnd,
                HWND_TOP as *mut core::ffi::c_void,
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
            );
        }
    }

    fn tile_grip_plan(video: Rect, cfg: &DockConfig, layout: &str) -> Vec<(isize, Rect)> {
        const THICK: i32 = 8;
        let mut out = Vec::new();
        if layout == "3plus1" || layout == "2plus1" {
            let stack_n = if layout == "2plus1" { 2 } else { 3 };
            let main_frac = cfg.main_frac.clamp(0.4, 0.85);
            let side = cfg.main_side.as_str();
            let stack = normalize_weights(&cfg.stack_weights[..stack_n], stack_n);
            if side == "top" || side == "bottom" {
                let main_h = ((video.height() as f64) * main_frac).round() as i32;
                let seam_y = if side == "top" {
                    video.top + main_h
                } else {
                    video.bottom - main_h
                };
                out.push((
                    2,
                    Rect {
                        left: video.left,
                        top: seam_y - THICK / 2,
                        right: video.right,
                        bottom: seam_y + THICK / 2 + 1,
                    },
                ));
                let stack_top = if side == "top" {
                    video.top + main_h
                } else {
                    video.top
                };
                let stack_bottom = if side == "top" {
                    video.bottom
                } else {
                    video.bottom - main_h
                };
                let mut x = video.left as f64;
                for seam in 0..stack_n.saturating_sub(1) {
                    x += video.width() as f64 * stack[seam];
                    out.push((
                        300 + seam as isize,
                        Rect {
                            left: x as i32 - THICK / 2,
                            top: stack_top,
                            right: x as i32 + THICK / 2 + 1,
                            bottom: stack_bottom,
                        },
                    ));
                }
            } else {
                let main_w = ((video.width() as f64) * main_frac).round() as i32;
                let seam_x = if side == "right" {
                    video.right - main_w
                } else {
                    video.left + main_w
                };
                out.push((
                    2,
                    Rect {
                        left: seam_x - THICK / 2,
                        top: video.top,
                        right: seam_x + THICK / 2 + 1,
                        bottom: video.bottom,
                    },
                ));
                let stack_left = if side == "right" {
                    video.left
                } else {
                    video.left + main_w
                };
                let stack_right = if side == "right" {
                    video.right - main_w
                } else {
                    video.right
                };
                let mut y = video.top as f64;
                for seam in 0..stack_n.saturating_sub(1) {
                    y += video.height() as f64 * stack[seam];
                    out.push((
                        300 + seam as isize,
                        Rect {
                            left: stack_left,
                            top: y as i32 - THICK / 2,
                            right: stack_right,
                            bottom: y as i32 + THICK / 2 + 1,
                        },
                    ));
                }
            }
            return out;
        }
        let (cols, rows) = grid_dims(layout);
        let col_w = normalize_weights(&cfg.col_weights, cols);
        let row_w = normalize_weights(&cfg.row_weights, rows);
        let mut x = video.left as f64;
        for seam in 0..cols.saturating_sub(1) {
            x += video.width() as f64 * col_w[seam];
            out.push((
                100 + seam as isize,
                Rect {
                    left: x as i32 - THICK / 2,
                    top: video.top,
                    right: x as i32 + THICK / 2 + 1,
                    bottom: video.bottom,
                },
            ));
        }
        let mut y = video.top as f64;
        for seam in 0..rows.saturating_sub(1) {
            y += video.height() as f64 * row_w[seam];
            out.push((
                200 + seam as isize,
                Rect {
                    left: video.left,
                    top: y as i32 - THICK / 2,
                    right: video.right,
                    bottom: y as i32 + THICK / 2 + 1,
                },
            ));
        }
        out
    }

    fn place_existing_tiles(g: &GripWindows, video: Rect, cfg: &DockConfig) {
        let n = cfg.channels.len().clamp(1, 8);
        let layout = effective_layout(n, &cfg.layout);
        let plan = tile_grip_plan(video, cfg, layout);
        unsafe {
            for &hwnd in &g.tiles {
                if hwnd.is_null() {
                    continue;
                }
                let code = GetWindowLongPtrW(hwnd, GWLP_USERDATA);
                if let Some((_, r)) = plan.iter().find(|(c, _)| *c == code) {
                    place_grip(hwnd, *r);
                }
            }
        }
    }

    fn dismiss_monitor_picker() {
        PICKER_OPEN.store(false, Ordering::SeqCst);
        let Ok(mut g) = grips().lock() else {
            return;
        };
        unsafe {
            for h in g.identifies.drain(..) {
                destroy_grip(h);
            }
        }
    }

    fn show_monitor_picker(instance: *mut core::ffi::c_void, class: *const u16) {
        dismiss_monitor_picker();
        let monitors = list_monitors();
        if monitors.is_empty() {
            return;
        }
        let Ok(mut g) = grips().lock() else {
            return;
        };
        PICKER_OPEN.store(true, Ordering::SeqCst);
        const BOX: i32 = 220;
        unsafe {
            for (i, m) in monitors.iter().enumerate() {
                let hwnd = create_grip(instance, class, 1000 + i as isize);
                if hwnd.is_null() {
                    continue;
                }
                let cx = m.full.left + m.full.width() / 2;
                let cy = m.full.top + m.full.height() / 2;
                place_grip(
                    hwnd,
                    Rect {
                        left: cx - BOX / 2,
                        top: cy - BOX / 2,
                        right: cx + BOX / 2,
                        bottom: cy + BOX / 2,
                    },
                );
                g.identifies.push(hwnd);
            }
        }
    }

    fn reposition_all_grips_static() {
        // Called from wnd_proc — grips mutex may already be contested; best-effort.
        let _ = reposition_grips_inner();
    }

    fn reposition_grips_inner() -> Result<(), ()> {
        let cfg = snapshot();
        let mut g = grips().lock().map_err(|_| ())?;
        if !cfg.linked || cfg.channels.is_empty() {
            unsafe {
                destroy_grip(g.chat);
                g.chat = std::ptr::null_mut();
                destroy_grip(g.mover);
                g.mover = std::ptr::null_mut();
                for h in g.tiles.drain(..) {
                    destroy_grip(h);
                }
                for h in g.identifies.drain(..) {
                    destroy_grip(h);
                }
            }
            PICKER_OPEN.store(false, Ordering::SeqCst);
            return Ok(());
        }
        let Some((video, chat_opt)) = chat_video_split(cfg.reserve_chat) else {
            return Ok(());
        };
        const THICK: i32 = 8;
        if cfg.reserve_chat {
            if let Some(chat) = chat_opt {
                let seam = Rect {
                    left: chat.left - THICK / 2,
                    top: video.top,
                    right: chat.left + THICK / 2,
                    bottom: video.bottom,
                };
                unsafe { place_grip(g.chat, seam) };
            }
        } else if !g.chat.is_null() {
            unsafe {
                destroy_grip(g.chat);
                g.chat = std::ptr::null_mut();
                destroy_grip(g.mover);
                g.mover = std::ptr::null_mut();
            }
        }
        // Live-move tile greys with the streams while dragging.
        place_existing_tiles(&g, video, &cfg);
        // Mover always last so it stays above the chat/tile grips.
        if cfg.reserve_chat && !g.mover.is_null() {
            unsafe { place_grip(g.mover, mover_rect(video, chat_opt)) };
        }
        Ok(())
    }

    let class_name = wide("StguiDockGrip");
    let instance = unsafe { GetModuleHandleW(std::ptr::null()) };
    let wc = WndClassEx {
        cb_size: std::mem::size_of::<WndClassEx>() as u32,
        style: 0,
        wnd_proc: Some(wnd_proc),
        cls_extra: 0,
        wnd_extra: 0,
        instance,
        icon: std::ptr::null_mut(),
        cursor: unsafe { LoadCursorW(std::ptr::null_mut(), IDC_SIZEWE) },
        background: std::ptr::null_mut(),
        menu_name: std::ptr::null(),
        class_name: class_name.as_ptr(),
        icon_sm: std::ptr::null_mut(),
    };
    unsafe {
        RegisterClassExW(&wc);
    }

    // Create initial chat + mover grip HWNDs (hidden until sync).
    {
        let chat = unsafe { create_grip(instance, class_name.as_ptr(), 1) };
        let mover = unsafe { create_grip(instance, class_name.as_ptr(), 10) };
        unsafe {
            if !chat.is_null() {
                ShowWindow(chat, 0);
            }
            if !mover.is_null() {
                ShowWindow(mover, 0);
            }
        }
        if let Ok(mut g) = grips().lock() {
            g.chat = chat;
            g.mover = mover;
        }
    }

    // Global hotkey so Ctrl+Shift+M works while mpv has focus.
    unsafe {
        let _ = RegisterHotKey(
            std::ptr::null_mut(),
            HOTKEY_CYCLE,
            MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT,
            VK_M,
        );
    }

    loop {
        // Drain commands
        let cmds = {
            let mut q = cmd_queue().lock().unwrap_or_else(|e| e.into_inner());
            std::mem::take(&mut *q)
        };
        for cmd in cmds {
            match cmd {
                DockCmd::Sync => sync_grips_full(instance, class_name.as_ptr()),
                DockCmd::HideGrips => hide_all_grips(),
                DockCmd::SuppressSeam => suppress_seam_grips_inner(),
                DockCmd::RestoreSeam => restore_seam_grips_inner(),
                DockCmd::RaiseGrips => unsafe { raise_grips_inner() },
                DockCmd::PickMonitor => {
                    if PICKER_OPEN.load(Ordering::SeqCst) {
                        dismiss_monitor_picker();
                    } else {
                        show_monitor_picker(instance, class_name.as_ptr());
                    }
                }
            }
        }

        let mut msg = unsafe { std::mem::zeroed::<Msg>() };
        // Process pending messages without blocking forever so we can poll cmds.
        let mut had = false;
        unsafe {
            while PeekMessageW(&mut msg, std::ptr::null_mut(), 0, 0, PM_REMOVE) != 0 {
                had = true;
                if msg.message == WM_HOTKEY && msg.wparam as i32 == HOTKEY_CYCLE {
                    show_monitor_picker(instance, class_name.as_ptr());
                    continue;
                }
                if msg.message == WM_DESTROY {
                    // ignore
                }
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
        if PICKER_OPEN.load(Ordering::SeqCst)
            && unsafe { (GetAsyncKeyState(VK_ESCAPE) as u16) & 0x8000 != 0 }
        {
            dismiss_monitor_picker();
        }
        if !had {
            thread::sleep(Duration::from_millis(16));
        }
    }

    fn hide_all_grips() {
        let Ok(g) = grips().lock() else {
            return;
        };
        unsafe {
            hide_grip(g.chat);
            hide_grip(g.mover);
            for &h in &g.tiles {
                hide_grip(h);
            }
            for &h in &g.identifies {
                hide_grip(h);
            }
        }
    }

    fn suppress_seam_grips_inner() {
        let Ok(g) = grips().lock() else {
            return;
        };
        unsafe {
            hide_grip(g.chat);
            hide_grip(g.mover);
        }
    }

    fn restore_seam_grips_inner() {
        let cfg = snapshot();
        if !cfg.linked || cfg.channels.is_empty() || !cfg.reserve_chat {
            return;
        }
        let Some((video, chat_opt)) = chat_video_split(true) else {
            return;
        };
        let Ok(g) = grips().lock() else {
            return;
        };
        const THICK: i32 = 8;
        unsafe {
            if let Some(chat) = chat_opt {
                if !g.chat.is_null() {
                    place_grip(
                        g.chat,
                        Rect {
                            left: chat.left - THICK / 2,
                            top: video.top,
                            right: chat.left + THICK / 2 + 1,
                            bottom: video.bottom,
                        },
                    );
                }
                if !g.mover.is_null() {
                    place_grip(g.mover, mover_rect(video, Some(chat)));
                }
            }
        }
    }

    fn sync_grips_full(instance: *mut core::ffi::c_void, class: *const u16) {
        if GRIPS_GROUP_MINIMIZED.load(Ordering::SeqCst) {
            hide_all_grips();
            return;
        }
        let cfg = snapshot();
        let Ok(mut g) = grips().lock() else {
            return;
        };
        unsafe {
            for h in g.tiles.drain(..) {
                destroy_grip(h);
            }
            if !cfg.linked || cfg.channels.is_empty() {
                hide_grip(g.chat);
                hide_grip(g.mover);
                for h in g.identifies.drain(..) {
                    destroy_grip(h);
                }
                PICKER_OPEN.store(false, Ordering::SeqCst);
                return;
            }
            if g.chat.is_null() {
                g.chat = create_grip(instance, class, 1);
            }
            if g.mover.is_null() {
                g.mover = create_grip(instance, class, 10);
            }
            let Some((video, chat_opt)) = chat_video_split(cfg.reserve_chat) else {
                return;
            };
            const THICK: i32 = 8;
            if cfg.reserve_chat {
                if let Some(chat) = chat_opt {
                    place_grip(
                        g.chat,
                        Rect {
                            left: chat.left - THICK / 2,
                            top: video.top,
                            right: chat.left + THICK / 2 + 1,
                            bottom: video.bottom,
                        },
                    );
                }
            } else {
                hide_grip(g.chat);
                hide_grip(g.mover);
            }

            let n = cfg.channels.len().clamp(1, 8);
            let layout = effective_layout(n, &cfg.layout);
            for (code, rect) in tile_grip_plan(video, &cfg, layout) {
                let hwnd = create_grip(instance, class, code);
                place_grip(hwnd, rect);
                g.tiles.push(hwnd);
            }
            // Always restack the move handle above every other grip.
            if cfg.reserve_chat {
                if let Some(chat) = chat_opt {
                    place_grip(g.mover, mover_rect(video, Some(chat)));
                }
            }
        }
        drop(g);
        // Sit above players without WS_EX_TOPMOST.
        unsafe {
            raise_grips_inner();
        }
    }

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
}
