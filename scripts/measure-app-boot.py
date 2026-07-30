"""Measure `npm run tauri dev` boot: vite ready, cargo build, window visible."""
import ctypes
import queue
import subprocess
import threading
import time

TITLE = "Streamlink Twitch GUI"


def window_visible() -> bool:
    buf = ctypes.create_unicode_buffer(512)
    found = []

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def cb(hwnd, _):
        if ctypes.windll.user32.IsWindowVisible(hwnd):
            n = ctypes.windll.user32.GetWindowTextW(hwnd, buf, 512)
            if n > 0 and TITLE.lower() in buf.value.lower():
                found.append(hwnd)
                return False
        return True

    ctypes.windll.user32.EnumWindows(cb, 0)
    return bool(found)


def main() -> None:
    t0 = time.perf_counter()

    def mark(label: str) -> None:
        print(f"{time.perf_counter() - t0:7.3f}s  {label}", flush=True)

    proc = subprocess.Popen(
        ["cmd", "/c", "npm", "run", "tauri", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    assert proc.stdout is not None
    lines: queue.Queue[str] = queue.Queue()
    threading.Thread(
        target=lambda: [lines.put(x) for x in proc.stdout], daemon=True
    ).start()

    mark("spawned npm run tauri dev")
    seen: set[str] = set()
    window_seen = False
    deadline = t0 + 180
    while time.perf_counter() < deadline:
        try:
            line = lines.get(timeout=0.1).strip()
        except queue.Empty:
            line = ""
        low = line.lower()
        for key, label in [
            ("ready in", "vite dev server ready"),
            ("dep", None),  # handled below
            ("finished", None),
            ("running", None),
        ]:
            pass
        if "ready in" in low and "vite" not in seen:
            seen.add("vite")
            mark(f"vite ready: {line[:80]}")
        if ("re-optimizing" in low or "optimized dependencies" in low) and "opt" not in seen:
            seen.add("opt")
            mark(f"vite deps: {line[:80]}")
        if "finished" in low and "cargo" not in seen and ("dev" in low or "profile" in low):
            seen.add("cargo")
            mark(f"cargo build finished: {line[:80]}")
        if not window_seen and window_visible():
            window_seen = True
            mark("app window visible")
            # give the WebView a moment, then stop
            time.sleep(3)
            break
    subprocess.run(
        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
        capture_output=True,
    )
    mark("dev environment killed")


if __name__ == "__main__":
    main()
