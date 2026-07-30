"""
Measures the fast-start pipeline: mpv pre-launched idle (window appears
immediately), streamlink serves the stream via local HTTP, and mpv gets a
`loadfile` command through its IPC named pipe once the server is up.

Usage: python scripts/measure-fast-start.py <channel>
"""
import os
import queue
import re
import subprocess
import sys
import tempfile
import threading
import time
import ctypes
from pathlib import Path

STREAMLINK = r"C:\Program Files\Streamlink\bin\streamlink.exe"
MPV = r"C:\Program Files\MPV Player\mpv.exe"
PORT = 8793


def find_window(title_sub: str) -> bool:
    buf = ctypes.create_unicode_buffer(512)
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def cb(hwnd, _):
        n = ctypes.windll.user32.GetWindowTextW(hwnd, buf, 512)
        if n > 0 and title_sub.lower() in buf.value.lower():
            found.append(hwnd)
            return False
        return True

    ctypes.windll.user32.EnumWindows(cb, 0)
    return bool(found)


def ipc_command(pipe: str, cmd: list, timeout: float = 5.0) -> str:
    """Send one JSON command to mpv's IPC pipe and return the reply line."""
    import json

    deadline = time.perf_counter() + timeout
    last_err: Exception | None = None
    while time.perf_counter() < deadline:
        try:
            with open(pipe, "r+b", buffering=0) as f:
                f.write((json.dumps({"command": cmd}) + "\n").encode())
                # mpv greets/events may precede the reply; read until "error"
                buf = b""
                while b"\n" not in buf:
                    chunk = f.read(1)
                    if not chunk:
                        break
                    buf += chunk
                return buf.decode(errors="replace").strip()
        except (FileNotFoundError, OSError) as e:
            last_err = e
            time.sleep(0.05)
    raise RuntimeError(f"IPC connect failed: {last_err}")


def main() -> None:
    channel = sys.argv[1] if len(sys.argv) > 1 else "sodapoppin"
    title = f"stgui-fast-{channel}"
    pipe = rf"\\.\pipe\{title}"
    mpv_log = Path(tempfile.gettempdir()) / f"mpv-fast-{channel}.log"
    mpv_log.unlink(missing_ok=True)

    t0 = time.perf_counter()
    marks: list[tuple[float, str]] = []

    def mark(label: str) -> None:
        marks.append((time.perf_counter() - t0, label))
        print(f"{marks[-1][0]:7.3f}s  {label}", flush=True)

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
            "--geometry=787x1032+0+0",
            f"--title={title}",
            f"--force-media-title={title}",
            f"--input-ipc-server={pipe}",
            f"--log-file={str(mpv_log).replace(os.sep, '/')}",
        ]
    )
    mark("mpv spawned (idle, windowed, ipc)")

    sl = subprocess.Popen(
        [
            STREAMLINK,
            "-l",
            "info",
            "--webbrowser",
            "no",
            "--player-external-http",
            "--player-external-http-interface",
            "127.0.0.1",
            "--player-external-http-port",
            str(PORT),
            "--player-external-http-continuous",
            "no",
            "--stream-segment-threads",
            "3",
            "--hls-segment-stream-data",
            f"twitch.tv/{channel}",
            "best",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    assert sl.stdout is not None
    lines: queue.Queue[str] = queue.Queue()
    threading.Thread(
        target=lambda: [lines.put(l) for l in sl.stdout], daemon=True
    ).start()

    window_seen = False
    loaded = False
    deadline = t0 + 60
    while time.perf_counter() < deadline:
        if not window_seen and find_window(title):
            window_seen = True
            mark("mpv window visible")
        try:
            line = lines.get(timeout=0.05).strip()
        except queue.Empty:
            line = ""
        m = re.search(r"http://127\.0\.0\.1:\d+/", line)
        if m and not loaded:
            mark(f"http server up: {m.group(0)}")
            reply = ipc_command(pipe, ["loadfile", m.group(0)])
            mark(f"loadfile reply: {reply[:60]}")
            loaded = True
        if "no playable streams" in line.lower():
            mark("FAILED: no playable streams")
            break
        if loaded:
            # first frame: watch mpv log for the video decoder
            if mpv_log.exists():
                for raw in mpv_log.read_text(errors="replace").splitlines():
                    if "[vd]" in raw:
                        ts = re.match(r"\[\s*(\d+\.\d+)\]", raw)
                        extra = (
                            f" => first-frame ~{0.0 + float(ts.group(1)):.3f}s (mpv-relative + spawn)"
                            if ts
                            else ""
                        )
                        mark(f"mpv video decoder active{extra}")
                        deadline = time.perf_counter()  # done
                        break
                else:
                    continue
                break
        if sl.poll() is not None and lines.empty():
            mark(f"streamlink exited (code {sl.returncode})")
            break

    for p in (sl, mpv):
        try:
            p.terminate()
        except OSError:
            pass
    subprocess.run(["taskkill", "/F", "/IM", "mpv.exe"], capture_output=True)

    if marks:
        print(f"\nTOTAL to last marker: {marks[-1][0]:.3f}s")
        print("PHASES:")
        for i in range(1, len(marks)):
            d = marks[i][0] - marks[i - 1][0]
            print(f"  +{d:6.3f}s  {marks[i][1][:70]}")


if __name__ == "__main__":
    main()
