#!/usr/bin/env bash
set -e

APPDIR="${1}"
INSTALLDIR="${2}"
VERSION="${3}"
LIBDIR="${APPDIR}/${INSTALLDIR}/lib"


# ----


SELF=$(basename "$(readlink -f "${0}")")
log() {
  echo "[${SELF}] $@"
}
err() {
  log >&2 "$@"
  exit 1
}

[[ $# -lt 3 ]] && err "Invalid arguments"
shift 3

[[ -f /.dockerenv ]] || err "This script is supposed to be run from build.sh inside a docker container"


declare -A DEPS
for dep in "$@"; do
  DEPS["$(cut -d= -f2- <<< "${dep}")"]=$(cut -d= -f1 <<< "${dep}")
done


install_dependencies() {
  log "Installing missing dependencies"

  log "Installing packages: ${DEPS[@]}"
  yum install -y --setopt=tsflags= "${DEPS[@]}"

  log "Copying libraries and license files"
  for lib in "${!DEPS[@]}"; do
    ( set -x; install -m755 -t "${LIBDIR}" "${lib}" )
    for path in $(repoquery --list "${DEPS["${lib}"]}" \
      | grep -Ei '^/usr/share/(doc|licenses)/.*(copying|licen[cs]e|readme|terms).*'
    ); do
      ( set -x; install -Dm644 -t "${APPDIR}${path}" "${path}" )
    done
  done
}

build_appimage() {
  log "Building appimage"
  [ "${SOURCE_DATE_EPOCH}" ] && mtime="@${SOURCE_DATE_EPOCH}" || mtime=now
  find "${APPDIR}" -exec touch --no-dereference "--date=${mtime}" '{}' '+'
  VERSION="${VERSION}" ARCH="$(uname -m)" /usr/local/bin/appimagetool \
    --verbose \
    --comp gzip \
    --no-appstream \
    "${APPDIR}" \
    output
}

build() {
  install_dependencies
  build_appimage
}

build
