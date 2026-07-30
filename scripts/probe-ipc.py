"""List named pipes and test mpv IPC creation — file-based to avoid shell escaping."""
import os
import subprocess
import sys
import time

MPV = r"C:\Program Files\MPV Player\mpv.exe"
PIPE_BASENAME = "stgui-mpv-ipcprobe"
PIPE = "\\\\.\\pipe\\" + PIPE_BASENAME  # literal \\.\pipe\stgui-mpv-ipcprobe


def stgui_pipes() -> list[str]:
    try:
        return [n for n in os.listdir("\\\\.\\pipe\\") if "stgui" in n.lower() or "mpv" in n.lower()]
    except OSError as e:
        return [f"<listdir failed: {e}>"]


def main() -> None:
    print("pipes before:", stgui_pipes())
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
    print("pipes after spawn:", stgui_pipes())
    try:
        with open(PIPE, "r+b", buffering=0) as f:
            f.write(b'{"command":["get_property","mpv-version"]}\n')
            print("python IPC OK:", f.readline()[:100])
    except OSError as e:
        print("python IPC FAIL:", e)
    mpv.terminate()


if __name__ == "__main__":
    sys.exit(main())
