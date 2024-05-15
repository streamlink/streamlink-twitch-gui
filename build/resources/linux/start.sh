#!/usr/bin/env bash
set -eu

APP=_streamlink-twitch-gui
HERE=$(dirname -- "$(readlink -f -- "${0}")")

[[ "${XDG_SESSION_TYPE:-}" == wayland ]] && OZONE_PLATFORM_WAYLAND=--ozone-platform=wayland

exec "${HERE}/${APP}" \
  ${OZONE_PLATFORM_WAYLAND:+"${OZONE_PLATFORM_WAYLAND}"} \
  "${@}"
