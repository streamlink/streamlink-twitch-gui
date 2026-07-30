"""Measures the CURRENT fast-start chain end to end, mirroring the app:

  click -> mpv idle window + show-text OSD -> Streamlink status lines
  mirrored to OSD -> loopback HTTP up -> IPC loadfile -> first frame
  -> window closed (WM_CLOSE) -> mpv process exit observed via blocking
  wait (what watch_player_exit sees) -> prune + Chatterino kill point.

Only kills the PIDs it spawned. Usage: python scripts/measure-new-chain.py [channel]
"""
import json
import os
import queue
import re
import subprocess
import sys
import tempfile
import threading
import time
import ctypes
from ctypes import wintypes
from pathlib import Path

STREAMLINK = r"C:\Program Files\Streamlink\bin\streamlink.exe"
MPV = r"C:\Program Files\MPV Player\mpv.exe"
PORT = 8794
CANDIDATES = ["sodapoppin", "shroud", "xqc", "summit1g", "lirik", "loltyler1"]

user32 = ctypes.windll.user32


def find_hwnd(substr, pid=None):
    found = []

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def cb(hwnd, _):
        buf = ctypes.create_unicode_buffer(512)
        n = user32.GetWindowTextW(hwnd, buf, 512)
        if n > 0 and substr.lower() in buf.value.lower():
            if pid is not None:
                p = wintypes.DWORD()
                user32.GetWindowThreadProcessId(hwnd, ctypes.byref(p))
                if p.value != pid:
                    return True
            found.append(hwnd)
            return False
        return True

    user32.EnumWindows(cb, 0)
    return found[0] if found else None


def ipc_command(pipe, cmd, timeout=5.0):
    deadline = time.perf_counter() + timeout
    last_err = None
    while time.perf_counter() < deadline:
        try:
            with open(pipe, "r+b", buffering=0) as f:
                f.write((json.dumps({"command": cmd}) + "\n").encode())
                buf = b""
                while b"\n" not in buf:
                    chunk = f.read(1)
                    if not chunk:
                        break
                    buf += chunk
                return buf.decode(errors="replace").strip()
        except OSError as e:
            last_err = e
            time.sleep(0.05)
    raise RuntimeError(f"IPC connect failed: {last_err}")


def main():
    channel = sys.argv[1] if len(sys.argv) > 1 else None
    channels = [channel] if channel else CANDIDATES
    title = "stgui-measure"
    pipe = rf"\\.\pipe\{title}"
    mpv_log = Path(tempfile.gettempdir()) / "mpv-measure.log"

    t0 = time.perf_counter()
    marks = []

    def mark(label):
        marks.append((time.perf_counter() - t0, label))
        print(f"{marks[-1][0]:7.3f}s  {label}", flush=True)

    mpv_log.unlink(missing_ok=True)
    mpv = subprocess.Popen(
        [
            MPV,
            "--idle=yes",
            "--force-window=yes",
            "--no-border",
            "--no-keepaspect-window",
            "--cache=no",
            "--demuxer-readahead-secs=0.5",
            "--watch-later-options-clr",
            "--geometry=787x1032+40+40",
            f"--title={title}",
            f"--force-media-title={title}",
            f"--input-ipc-server={pipe}",
            f"--log-file={str(mpv_log).replace(os.sep, '/')}",
        ]
    )
    mark("mpv spawned (idle)")

    def osd(msg):
        try:
            ipc_command(pipe, ["show-text", msg, "600000"], timeout=2.0)
        except RuntimeError:
            pass

    threading.Thread(target=lambda: osd(f"Starting {channels[0]}…"), daemon=True).start()

    sl = None
    lines = queue.Queue()
    for cand in channels:
        probe = subprocess.Popen(
            [
                STREAMLINK, "-l", "info", "--webbrowser", "no",
                "--player-external-http",
                "--player-external-http-interface", "127.0.0.1",
                "--player-external-http-port", str(PORT),
                "--player-external-http-continuous", "no",
                "--stream-segment-threads", "3",
                "--hls-segment-stream-data",
                f"twitch.tv/{cand}", "best",
            ],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, encoding="utf-8", errors="replace",
        )
        # quick liveness check: read lines for up to 8s
        t_check = time.perf_counter()
        prebuffer = []
        live = None
        while time.perf_counter() - t_check < 8:
            line = probe.stdout.readline()
            if not line:
                live = False
                break
            prebuffer.append(line)
            low = line.lower()
            if "available streams" in low:
                live = True
            if "no playable streams" in low:
                live = False
                break
        if live:
            sl = probe
            mark(f"channel live: {cand}")
            for l in prebuffer:
                lines.put(l)
            threading.Thread(
                target=lambda: [lines.put(l) for l in sl.stdout], daemon=True
            ).start()
            break
        probe.kill()
        mark(f"channel offline: {cand}")

    if sl is None:
        mark("FAILED: no candidate channel is live")
        mpv.kill()
        return

    window_seen = loaded = False
    last_osd = ""
    deadline = t0 + 90
    while time.perf_counter() < deadline:
        if not window_seen and find_hwnd(title, mpv.pid):
            window_seen = True
            mark("mpv window visible")
        try:
            line = lines.get(timeout=0.05).strip()
        except queue.Empty:
            line = ""
        if line and not loaded:
            low = line.lower()
            # mirror phase lines to OSD like the app does (deduped)
            phase = None
            if "pre-roll ads" in low:
                phase = "Waiting for pre-roll ads…"
            elif "opening stream" in low:
                phase = "Opening stream…"
            elif "found matching plugin" in low:
                phase = "Resolving channel…"
            if phase and phase != last_osd:
                last_osd = phase
                osd(phase)
                mark(f"OSD phase: {phase}")
        m = re.search(r"http://127\.0\.0\.1:\d+/", line)
        if m and not loaded:
            mark(f"http server up: {m.group(0)}")
            reply = ipc_command(pipe, ["loadfile", m.group(0)])
            mark(f"loadfile reply: {reply[:60]}")
            loaded = True
            osd("")  # clear loading OSD
        if loaded and mpv_log.exists():
            for raw in mpv_log.read_text(errors="replace").splitlines():
                if "[vd]" in raw:
                    mark("mpv video decoder active (first frame)")
                    deadline = time.perf_counter()
                    break
            else:
                continue
            break
        if sl.poll() is not None and lines.empty():
            mark(f"streamlink exited (code {sl.returncode})")
            break

    if not loaded:
        mark("FAILED: stream never attached")
        for p in (sl, mpv):
            try:
                p.kill()
            except OSError:
                pass
        return

    # --- close phase: user closes the mpv window ---
    t_close = time.perf_counter()
    hwnd = find_hwnd(title, mpv.pid)
    if hwnd:
        user32.PostMessageW(hwnd, 0x0010, 0, 0)  # WM_CLOSE
    rc = mpv.wait(timeout=10)
    closed_in = time.perf_counter() - t_close
    marks.append((time.perf_counter() - t0, ""))
    print(f"\nclose -> mpv process gone (rc={rc}): {closed_in:.3f}s")
    print("(watch_player_exit wakes here; prune + TerminateProcess(Chatterino) is ~ms)")

    try:
        sl.kill()
    except OSError:
        pass

    print("\nSUMMARY")
    for i in range(1, len(marks)):
        d = marks[i][0] - marks[i - 1][0]
        label = marks[i][1] or "(window close)"
        print(f"  +{d:6.3f}s  {label[:70]}")
    print(f"\nclick -> first frame: {marks[-2][0]:.3f}s")
    print(f"close -> chatterino-close point: {closed_in:.3f}s")


if __name__ == "__main__":
    main()
