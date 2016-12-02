#!/usr/bin/env bash

DIR=$(readlink -f "${0}")
HERE=$(dirname "${DIR}")

TMP=$(mktemp --directory)
DESKTOP="${TMP}/streamlink-twitch-gui.desktop"

cat << EOF > "${DESKTOP}"
[Desktop Entry]
Type=Application
Name=Streamlink Twitch GUI
GenericName=Twitch.tv browser for streamlink
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=streamlink;livestreamer;twitch;
Categories=AudioVideo;
Exec=${HERE}/start.sh
Icon=streamlink-twitch-gui
EOF

xdg-desktop-menu install "${DESKTOP}"
xdg-icon-resource install --size 16 "${HERE}/icons/icon-16.png" streamlink-twitch-gui
xdg-icon-resource install --size 32 "${HERE}/icons/icon-32.png" streamlink-twitch-gui
xdg-icon-resource install --size 48 "${HERE}/icons/icon-48.png" streamlink-twitch-gui
xdg-icon-resource install --size 64 "${HERE}/icons/icon-64.png" streamlink-twitch-gui
xdg-icon-resource install --size 128 "${HERE}/icons/icon-128.png" streamlink-twitch-gui
xdg-icon-resource install --size 256 "${HERE}/icons/icon-256.png" streamlink-twitch-gui

rm "${DESKTOP}"
rm -R "${TMP}"
