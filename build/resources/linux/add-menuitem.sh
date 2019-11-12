#!/usr/bin/env bash

APP="streamlink-twitch-gui"

DIR=$(readlink -f "${0}")
HERE=$(dirname "${DIR}")

TMP=$(mktemp --directory)
DESKTOP="${TMP}/${APP}.desktop"

cat << EOF > "${DESKTOP}"
[Desktop Entry]
Type=Application
Name=Streamlink Twitch GUI
GenericName=Twitch.tv browser for Streamlink
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=streamlink;twitch;
Categories=AudioVideo;Network;
Exec=${HERE}/${APP}
Icon=${APP}
EOF

xdg-desktop-menu install "${DESKTOP}"
for SIZE in 16 32 48 64 128 256; do
	xdg-icon-resource install --size "${SIZE}" "${HERE}/icons/icon-${SIZE}.png" "${APP}"
done

rm "${DESKTOP}"
rmdir "${TMP}"
