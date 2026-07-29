#!/usr/bin/env bash

APP="streamlink-twitch-gui"

xdg-desktop-menu uninstall "${APP}.desktop"
for SIZE in 16 32 48 64 128 256; do
	xdg-icon-resource uninstall --size "${SIZE}" "${APP}"
done
