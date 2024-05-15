#!/usr/bin/env bash
set -eu

APP=streamlink-twitch-gui

for dep in xdg-desktop-menu xdg-icon-resource; do
  command -v "${dep}" >/dev/null 2>&1 || { echo >&2 "Missing dependency: ${dep}"; exit 1; }
done

xdg-desktop-menu uninstall "${APP}.desktop"
for SIZE in 16 32 48 64 128 256; do
  xdg-icon-resource uninstall --size "${SIZE}" "${APP}"
done
