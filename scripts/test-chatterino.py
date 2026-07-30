"""Evidence: is Chatterino single-instance? Does our owned-pid kill work?

1. Notes running chatterino PIDs.
2. Launches chatterino.exe --channels=t:evtestprobe (like the app does).
3. Watches whether the spawned child exits quickly (single-instance
   forwarding => owned pid is stale => TerminateProcess kills nothing).
"""

import subprocess
import time

CHATTERINO = r"C:\Program Files\Chatterino\chatterino.exe"


def pids():
    out = subprocess.run(
        ["tasklist", "/FI", "IMAGENAME eq chatterino.exe", "/FO", "CSV", "/NH"],
        capture_output=True, text=True,
    ).stdout
    return {
        int(line.split(",")[1].strip('"'))
        for line in out.strip().splitlines()
        if "chatterino" in line.lower()
    }


before = pids()
print("before:", before)

proc = subprocess.Popen(
    [CHATTERINO, "--channels=t:evtestprobe"],
    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
print("spawned child pid:", proc.pid)
for i in range(10):
    time.sleep(1)
    rc = proc.poll()
    now = pids()
    print(f"  t={i + 1}s child_rc={rc} chatterino_pids={sorted(now)}")
    if rc is not None:
        break

print("RESULT child_rc:", proc.poll())
new_pids = pids() - before
print("new persistent pids:", sorted(new_pids))
# cleanup: kill only the probe instance if it is new and persistent
for pid in new_pids:
    subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
print("done")
