"""Evidence round 2 — exact app dock args, PrintWindow capture (no occlusion).

Tests with the REAL arg set the app builds (incl. --loop-file=inf,
--no-keepaspect-window, --window-maximized=yes):
  A) idle window: does osd-msg1 / show-text actually render? (PrintWindow shots)
  B) idle close: does the process exit?
  C) playing close (lavfi via IPC loadfile): does the process exit?
"""

import json
import struct
import subprocess
import time
from ctypes import wintypes
import ctypes

from PIL import Image

MPV = r"C:\Program Files\MPV Player\mpv.exe"
TITLE = "stgui-evtest2"
PIPE = r"\\.\pipe\stgui-evidence2"

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32


def find_hwnd(substr: str, pid: int):
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        buf = ctypes.create_unicode_buffer(512)
        user32.GetWindowTextW(hwnd, buf, 512)
        proc_id = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(proc_id))
        if (
            substr.lower() in buf.value.lower()
            and proc_id.value == pid
            and user32.IsWindowVisible(hwnd)
        ):
            found.append(hwnd)
        return True

    user32.EnumWindows(cb, 0)
    return found[0] if found else None


def print_window(hwnd, path):
    rect = wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    w, h = rect.right - rect.left, rect.bottom - rect.top
    hwnd_dc = user32.GetWindowDC(hwnd)
    mem_dc = gdi32.CreateCompatibleDC(hwnd_dc)
    bmp = gdi32.CreateCompatibleBitmap(hwnd_dc, w, h)
    gdi32.SelectObject(mem_dc, bmp)
    ok = user32.PrintWindow(hwnd, mem_dc, 2)  # PW_RENDERFULLCONTENT
    # BITMAPINFOHEADER for 32bpp top-down DIB
    bih = struct.pack("<IiiHHIIiiII", 40, w, -h, 1, 32, 0, 0, 0, 0, 0, 0)
    buf = ctypes.create_string_buffer(w * h * 4)
    gdi32.GetDIBits(mem_dc, bmp, 0, h, buf, bih, 0)
    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(mem_dc)
    user32.ReleaseDC(hwnd, hwnd_dc)
    img = Image.frombytes("RGBA", (w, h), buf, "raw", "BGRA")
    img.save(path)
    print(f"  PrintWindow(ok={ok}) -> {path} ({w}x{h})")


def ipc(cmd, timeout=5.0):
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        try:
            with open(PIPE, "r+b", buffering=0) as f:
                f.write((json.dumps({"command": cmd}) + "\n").encode())
                deadline2 = time.time() + 2.0
                buf = b""
                while time.time() < deadline2:
                    ch = f.read(1)
                    if not ch:
                        break
                    buf += ch
                    if ch == b"\n":
                        line = buf.decode(errors="replace")
                        if '"error"' in line:
                            return line.strip()
                        buf = b""
                return "NO-REPLY"
        except OSError as e:
            last = e
            time.sleep(0.1)
    return f"CONNECT-FAIL {last}"


def wait_hwnd(pid, timeout=5.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        h = find_hwnd(TITLE, pid)
        if h:
            return h
        time.sleep(0.1)
    return None


def close_and_poll(proc, label):
    hwnd = wait_hwnd(proc.pid, 1.0)
    if not hwnd:
        print(f"  {label}: no window to close!")
        proc.kill()
        return
    user32.PostMessageW(hwnd, 0x0010, 0, 0)  # WM_CLOSE
    t0 = time.time()
    while time.time() - t0 < 6:
        rc = proc.poll()
        if rc is not None:
            print(f"  {label}: process EXITED after {time.time() - t0:.2f}s (rc={rc})")
            return
        time.sleep(0.1)
    print(f"  {label}: process STILL ALIVE after 6s (window gone: {wait_hwnd(proc.pid, 0.3) is None})")
    proc.kill()


# EXACT dock args the app builds (streaming.rs mpv_dock_arg_parts + preset)
args = [
    MPV,
    "--geometry=50%x50%+200+150",
    "--force-window=yes",
    "--keep-open=no",
    "--no-border",
    "--cache=no",
    "--demuxer-readahead-secs=0.5",
    "--watch-later-options-clr",
    "--no-keepaspect-window",
    "--loop-playlist=inf",
    "--loop-file=inf",
    "--window-maximized=no",
    f"--title={TITLE}",
    f"--force-media-title={TITLE}",
    "--idle=yes",
    f"--input-ipc-server={PIPE}",
]

print("== A: idle, full app args ==")
proc = subprocess.Popen(args, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
hwnd = wait_hwnd(proc.pid)
print(f"  window: {'found' if hwnd else 'NOT FOUND'}")
if hwnd:
    time.sleep(0.6)
    print_window(hwnd, "scripts/evidence-a1-idle-default.png")
    print("  set osd-msg1:", ipc(["set", "osd-msg1", "Starting evtest2…"]))
    time.sleep(0.6)
    print_window(hwnd, "scripts/evidence-a2-idle-osdmsg.png")
    print("  show-text:", ipc(["show-text", "show-text probe", "4000"]))
    time.sleep(0.4)
    print_window(hwnd, "scripts/evidence-a3-idle-showtext.png")
    time.sleep(4.0)
    close_and_poll(proc, "B: idle close")
time.sleep(0.5)

print("== C: playing, full app args ==")
proc = subprocess.Popen(args, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
hwnd = wait_hwnd(proc.pid)
print(f"  window: {'found' if hwnd else 'NOT FOUND'}")
print("  loadfile:", ipc(["loadfile", "av://lavfi:testsrc=duration=120:size=640x360:rate=30"]))
time.sleep(2.0)
hwnd = wait_hwnd(proc.pid, 2.0)
if hwnd:
    print_window(hwnd, "scripts/evidence-c1-playing.png")
close_and_poll(proc, "C: playing close")
print("done")
