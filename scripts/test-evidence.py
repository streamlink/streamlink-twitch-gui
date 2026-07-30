"""Evidence tests: does idle/playing mpv exit on window close? Is osd-msg1 visible?

Spawns mpv exactly like the app does (dock args + --idle + IPC pipe), then:
  1. screenshots the idle window (baseline "default screen")
  2. sets osd-msg1 via IPC, verifies via get_property, screenshots again
  3. closes the window (WM_CLOSE) and polls whether the PROCESS exits
  4. repeats the close test while playing a lavfi test source
Prints timings; saves scripts/evidence-*.png for visual inspection.
"""

import json
import subprocess
import time
from ctypes import wintypes
import ctypes

from PIL import ImageGrab

MPV = r"C:\Program Files\MPV Player\mpv.exe"
TITLE = "stgui-evtest"
PIPE = r"\\.\pipe\stgui-evidence"

user32 = ctypes.windll.user32


def find_hwnd(substr: str):
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        buf = ctypes.create_unicode_buffer(512)
        user32.GetWindowTextW(hwnd, buf, 512)
        if substr.lower() in buf.value.lower() and user32.IsWindowVisible(hwnd):
            found.append(hwnd)
        return True

    user32.EnumWindows(cb, 0)
    return found[0] if found else None


def shot(hwnd, path):
    rect = wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    img = ImageGrab.grab((rect.left, rect.top, rect.right, rect.bottom))
    img.save(path)
    print(f"  screenshot -> {path} ({rect.right - rect.left}x{rect.bottom - rect.top})")


def ipc(cmd, timeout=5.0):
    """Send one JSON command; retry connecting until timeout. Returns reply line."""
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        try:
            with open(PIPE, "r+b", buffering=0) as f:
                f.write((json.dumps({"command": cmd}) + "\n").encode())
                buf = b""
                for _ in range(50):
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


def wait_hwnd(timeout=5.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        h = find_hwnd(TITLE)
        if h:
            return h
        time.sleep(0.1)
    return None


def close_and_poll(proc, label):
    hwnd = find_hwnd(TITLE)
    if not hwnd:
        print(f"  {label}: no window to close!")
        return
    user32.PostMessageW(hwnd, 0x0010, 0, 0)  # WM_CLOSE
    t0 = time.time()
    while time.time() - t0 < 6:
        rc = proc.poll()
        if rc is not None:
            print(f"  {label}: process EXITED after {time.time() - t0:.2f}s (rc={rc})")
            return
        time.sleep(0.1)
    print(f"  {label}: process STILL ALIVE after 6s (window gone: {find_hwnd(TITLE) is None})")
    proc.kill()


base_args = [
    MPV,
    "--geometry=40%x40%+100+100",
    "--force-window=yes",
    "--keep-open=no",
    "--no-border",
    "--cache=no",
    f"--title={TITLE}",
    f"--force-media-title={TITLE}",
    "--idle=yes",
    f"--input-ipc-server={PIPE}",
]

print("== Experiment 1: idle window ==")
proc = subprocess.Popen(base_args, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
hwnd = wait_hwnd()
print(f"  window: {'found' if hwnd else 'NOT FOUND'}")
if hwnd:
    time.sleep(0.6)
    shot(hwnd, "scripts/evidence-1-idle-default.png")
    print("  set osd-msg1:", ipc(["set", "osd-msg1", "Starting evtest…"]))
    print("  get osd-msg1:", ipc(["get_property", "osd-msg1"]))
    time.sleep(0.6)
    shot(hwnd, "scripts/evidence-2-idle-osdmsg.png")
    print("  show-text:", ipc(["show-text", "show-text probe", "3000"]))
    time.sleep(0.4)
    shot(hwnd, "scripts/evidence-3-idle-showtext.png")
    time.sleep(3.0)  # let show-text fade
    close_and_poll(proc, "idle close")
    if proc.poll() is None:
        # still alive: does loadfile still work / does a window come back?
        print("  post-close loadfile:", ipc(["loadfile", "av://lavfi:testsrc=duration=5:size=320x180"]))
        time.sleep(1.5)
        hwnd2 = wait_hwnd(2.0)
        print(f"  window after loadfile: {'RE-CREATED' if hwnd2 else 'still none'}")
        proc.kill()
time.sleep(0.5)

print("== Experiment 2: playing window ==")
proc = subprocess.Popen(base_args, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
hwnd = wait_hwnd()
print(f"  window: {'found' if hwnd else 'NOT FOUND'}")
print("  loadfile:", ipc(["loadfile", "av://lavfi:testsrc=duration=60:size=640x360:rate=30"]))
time.sleep(1.5)
hwnd = wait_hwnd()
if hwnd:
    shot(hwnd, "scripts/evidence-4-playing.png")
close_and_poll(proc, "playing close")
print("done")
