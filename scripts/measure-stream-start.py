"""
Measures where the time goes between `stream_start` and a visible player.

Spawns streamlink with the exact args the app builds, timestamps every log
line, polls for the mpv window (title stgui-<channel>) and records when it
appears. mpv writes its own log so the first-video-frame marker can be found.

Usage: python scripts/measure-stream-start.py <channel> [extra streamlink args...]
"""
import ctypes
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

STREAMLINK = r"C:\Program Files\Streamlink\bin\streamlink.exe"
MPV = r"C:\Program Files\MPV Player\mpv.exe"


def find_window(title_sub: str) -> bool:
    buf = ctypes.create_unicode_buffer(512)

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def cb(hwnd, _):
        n = ctypes.windll.user32.GetWindowTextW(hwnd, buf, 512)
        return title_sub.lower() not in buf.value.lower()

    ctypes.windll.user32.EnumWindows(cb, 0)
    # EnumWindows stops early when cb returns False -> window found.
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def cb2(hwnd, _):
        n = ctypes.windll.user32.GetWindowTextW(hwnd, buf, 512)
        if n > 0 and title_sub.lower() in buf.value.lower():
            found.append(hwnd)
            return False
        return True

    ctypes.windll.user32.EnumWindows(cb2, 0)
    return bool(found)


def main() -> None:
    channel = sys.argv[1] if len(sys.argv) > 1 else "xqc"
    extra = sys.argv[2:]
    t0 = time.perf_counter()
    title = f"stgui-{channel}"
    mpv_log = Path(tempfile.gettempdir()) / f"mpv-measure-{channel}.log"
    mpv_log.unlink(missing_ok=True)
    # streamlink splits --player-args with posix shlex and EATS backslashes —
    # pass forward slashes or the log path never reaches mpv (measured).
    mpv_log_arg = str(mpv_log).replace("\\", "/")

    player_args = (
        "--force-window=yes --keep-open=no --no-border --no-keepaspect-window "
        "--cache=no --demuxer-readahead-secs=0.5 --watch-later-options-clr "
        f"{os.environ.get('MPV_EXTRA', '')} "
        f"--title={title} --force-media-title={title} --log-file={mpv_log_arg}"
    )
    args = [
        STREAMLINK,
        "-l",
        "info",
        "--webbrowser",
        "no",
        "--stream-segment-threads",
        "3",
        "--hls-segment-stream-data",
        "--title",
        title,
        "--player",
        MPV,
        "--player-args",
        player_args,
        *extra,
        f"twitch.tv/{channel}",
        "best",
    ]
    proc = subprocess.Popen(
        args,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    marks: list[tuple[float, str]] = []

    def mark(label: str) -> None:
        marks.append((time.perf_counter() - t0, label))
        print(f"{marks[-1][0]:7.3f}s  {label}", flush=True)

    window_seen = False
    assert proc.stdout is not None
    deadline = t0 + 60
    import queue
    import threading

    lines: queue.Queue[str] = queue.Queue()
    threading.Thread(
        target=lambda: [lines.put(l) for l in proc.stdout], daemon=True
    ).start()

    mark("process spawned")
    while time.perf_counter() < deadline:
        try:
            line = lines.get(timeout=0.05).strip()
        except queue.Empty:
            line = ""
        low = line.lower()
        if line and len(marks) == 1:
            mark(f"first log line: {line[:80]}")
        if "found matching plugin" in low:
            mark(f"plugin matched: {line[:80]}")
        if "available streams" in low:
            mark(f"playlist resolved: {line[:80]}")
        if "opening stream" in low:
            mark(f"opening stream: {line[:80]}")
        if "starting player" in low:
            mark(f"starting player: {line[:80]}")
        if "no playable streams" in low or "unable to find" in low:
            mark(f"FAILED: {line[:100]}")
            break
        if not window_seen and find_window(title):
            window_seen = True
            mark("mpv window visible")
            # mpv has --force-window=yes: the window appears at player start,
            # not at first frame. Watch the mpv log for the video decoder —
            # its [t.sss] prefix is seconds since mpv start, so report it
            # relative to the "starting player" mark.
            t_player = next((t for t, l in marks if l.startswith("starting player")), None)
            first_frame_deadline = time.perf_counter() + 15
            while time.perf_counter() < first_frame_deadline:
                if mpv_log.exists():
                    hit = None
                    for raw in mpv_log.read_text(errors="replace").splitlines():
                        if "[vd]" in raw or "(+) Video" in raw:
                            hit = raw.strip()
                            break
                    if hit:
                        rel = ""
                        import re

                        m = re.match(r"\[\s*(\d+\.\d+)\]", hit)
                        if m and t_player is not None:
                            rel = f" => first-frame ~{t_player + float(m.group(1)):.3f}s"
                        mark(f"mpv video decoder active{rel}")
                        break
                time.sleep(0.1)
            break
        if proc.poll() is not None and lines.empty():
            mark(f"streamlink exited (code {proc.returncode})")
            break

    try:
        proc.terminate()
    except OSError:
        pass
    subprocess.run(
        ["taskkill", "/F", "/IM", "mpv.exe"],
        capture_output=True,
    )
    total = marks[-1][0] if marks else 0
    print(f"\nTOTAL to last marker: {total:.3f}s")
    deltas = [(marks[i][0] - marks[i - 1][0], marks[i][1]) for i in range(1, len(marks))]
    print("PHASES:")
    for d, label in deltas:
        print(f"  +{d:6.3f}s  {label[:70]}")


if __name__ == "__main__":
    main()
