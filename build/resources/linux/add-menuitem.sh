#!/usr/bin/env bash
set -eu

APP=streamlink-twitch-gui
HERE=$(dirname -- "$(readlink -f -- "${0}")")

for dep in xdg-desktop-menu xdg-icon-resource; do
  command -v "${dep}" >/dev/null 2>&1 || { echo >&2 "Missing dependency: ${dep}"; exit 1; }
done

# shellcheck disable=SC2064
TMP=$(mktemp --directory) && trap "rm -rf ${TMP}" EXIT || exit 255
DESKTOP="${TMP}/${APP}.desktop"

cat << EOF > "${DESKTOP}"
[Desktop Entry]
Type=Application
Name=Streamlink Twitch GUI
GenericName=Twitch.tv browser for Streamlink
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=streamlink;twitch;
Categories=AudioVideo;Network;
StartupWMClass=streamlink-twitch-gui
Exec=${HERE}/${APP}
Icon=${APP}
EOF

xdg-desktop-menu install "${DESKTOP}"
for SIZE in 16 32 48 64 128 256; do
  xdg-icon-resource install --size "${SIZE}" "${HERE}/icons/icon-${SIZE}.png" "${APP}"
done
