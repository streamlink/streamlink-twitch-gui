"""Run the Rust probe_mpv_ipc test against a live mpv spawned without any shell."""
import os
import subprocess
import time

MPV = r"C:\Program Files\MPV Player\mpv.exe"
PIPE = "\\\\.\\pipe\\stgui-mpv-ipcprobe"  # literal \\.\pipe\stgui-mpv-ipcprobe

mpv = subprocess.Popen(
    [
        MPV,
        "--idle=yes",
        "--force-window=yes",
        "--no-border",
        "--title=stgui-ipcprobe",
        f"--input-ipc-server={PIPE}",
    ]
)
time.sleep(2)
env = dict(os.environ, STGUI_PROBE_PIPE=PIPE)
r = subprocess.run(
    [
        "cargo",
        "test",
        "--manifest-path",
        "src-tauri/Cargo.toml",
        "probe_mpv_ipc",
        "--",
        "--ignored",
        "--nocapture",
    ],
    env=env,
    capture_output=True,
    text=True,
)
for line in (r.stdout + r.stderr).splitlines():
    if "EVID" in line or "test result" in line:
        print(line)
mpv.terminate()
