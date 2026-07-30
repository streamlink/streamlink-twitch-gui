"""Probe: show-text long-duration render, replace semantics, and clear."""

import json
import struct
import subprocess
import time
from ctypes import wintypes
import ctypes

from PIL import Image

MPV = r"C:\Program Files\MPV Player\mpv.exe"
TITLE = "stgui-osdprobe"
PIPE = r"\\.\pipe\stgui-osdprobe"

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32


def find_hwnd(substr, pid):
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        buf = ctypes.create_unicode_buffer(512)
        user32.GetWindowTextW(hwnd, buf, 512)
        p = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(p))
        if substr.lower() in buf.value.lower() and p.value == pid and user32.IsWindowVisible(hwnd):
            found.append(hwnd)
        return True

    user32.EnumWindows(cb, 0)
    return found[0] if found else None


def print_window(hwnd, path):
    rect = wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    w, h = rect.right - rect.left, rect.bottom - rect.top
    dc = user32.GetWindowDC(hwnd)
    mem = gdi32.CreateCompatibleDC(dc)
    bmp = gdi32.CreateCompatibleBitmap(dc, w, h)
    gdi32.SelectObject(mem, bmp)
    user32.PrintWindow(hwnd, mem, 2)
    bih = struct.pack("<IiiHHIIiiII", 40, w, -h, 1, 32, 0, 0, 0, 0, 0, 0)
    buf = ctypes.create_string_buffer(w * h * 4)
    gdi32.GetDIBits(mem, bmp, 0, h, buf, bih, 0)
    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(mem)
    user32.ReleaseDC(hwnd, dc)
    Image.frombytes("RGBA", (w, h), buf, "raw", "BGRA").save(path)
    print(f"  shot -> {path}")


def ipc(cmd, timeout=5.0):
    deadline = time.time() + timeout
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
        except OSError:
            time.sleep(0.1)
    return "CONNECT-FAIL"


proc = subprocess.Popen(
    [
        MPV,
        "--geometry=50%x50%+200+150",
        "--force-window=yes",
        "--keep-open=no",
        "--no-border",
        f"--title={TITLE}",
        "--idle=yes",
        f"--input-ipc-server={PIPE}",
    ],
    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
deadline = time.time() + 5
hwnd = None
while time.time() < deadline and not hwnd:
    hwnd = find_hwnd(TITLE, proc.pid)
    time.sleep(0.1)
print("window:", bool(hwnd))
time.sleep(0.5)

print("show-text A:", ipc(["show-text", "Starting somechannel…", "600000"]))
time.sleep(0.5)
print_window(hwnd, "scripts/probe-osd-a.png")
print("show-text B:", ipc(["show-text", "Waiting for pre-roll ads…", "600000"]))
time.sleep(0.5)
print_window(hwnd, "scripts/probe-osd-b.png")
print("clear:", ipc(["show-text", "", "1"]))
time.sleep(0.5)
print_window(hwnd, "scripts/probe-osd-clear.png")

proc.kill()
print("done")
