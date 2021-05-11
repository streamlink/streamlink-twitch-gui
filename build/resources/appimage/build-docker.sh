#!/usr/bin/env bash
set -e

APPDIR="${1}"
INSTALLDIR="${2}"
VERSION="${3}"
ARCH="${4}"
LIBDIR="${APPDIR}/${INSTALLDIR}/lib"

declare -A excludepackages=(
  [gtk3]=true
)


# ----


SELF=$(basename "$(readlink -f "${0}")")
log() {
  echo "[${SELF}] $@"
}
err() {
  log >&2 "$@"
  exit 1
}

[[ $# == 4 ]] || err "Invalid arguments"
[[ -f /.dockerenv ]] || err "This script is supposed to be run from build.sh inside a docker container"

for pkg in $(repoquery --queryformat="%{name}" --requires --recursive --resolve "${!excludepackages[@]}" | sort -u); do
  excludepackages["${pkg}"]=true
done

declare -A excludelibraries
for lib in $(sed -e '/#.*/d; /^[[:space:]]*|[[:space:]]*$/d; /^$/d' /usr/local/share/appimage/excludelist); do
  excludelibraries["${lib}"]=true
done


find_dependencies() {
  log "Finding missing dependencies for: $@"
  declare -A libs
  for file in "$@"; do
    [[ -f "${file}" && -x "${file}" ]] || err "File does not exist or is not executable: ${file}"
    for lib in $(LD_LIBRARY_PATH=$(dirname "${file}") ldd "${file}" | awk '/ => not found/ {print $1}'); do
      # don't check a lib more than once
      [[ -n "${excludelibraries["${lib}"]}" ]] && continue
      excludelibraries["${lib}"]=true
      # find the lib's package
      local package=$(repoquery --queryformat="%{name}" --file "${lib}" | head -n1)
      [[ -z "${package}" ]] && err "Missing package for: ${lib}"
      [[ -n "${excludepackages["${package}"]}" ]] && continue
      libs["${lib}"]="${package}"
    done
  done

  [[ ${#libs[@]} == 0 ]] && return

  log "Installing packages: ${libs[@]}"
  yum install -y --setopt=tsflags= "${libs[@]}"
  log "Copying libraries"
  for lib in "${!libs[@]}"; do
    for path in $(repoquery --list --archlist "${ARCH}" "${libs["${lib}"]}"); do
      if [[ "$(basename -- "${path}")" == "${lib}" ]]; then
        ( set -x; install -m755 -t "${LIBDIR}" "${path}" )
      fi
      if echo "${path}" | grep -Ei '^/usr/share/(doc|licenses)/.*(copying|licen[cs]e|readme|terms).*'; then
        ( set -x; install -Dm644 -t "${APPDIR}${path}" "${path}" )
      fi
    done
  done

  find_dependencies $(echo "${!libs[@]}" | tr ' ' '\n' | while read -r lib; do echo "${LIBDIR}/${lib}"; done)
}

build_appimage() {
  log "Building appimage"
  [ "${SOURCE_DATE_EPOCH}" ] && mtime="@${SOURCE_DATE_EPOCH}" || mtime=now
  find "${APPDIR}" -exec touch --no-dereference "--date=${mtime}" '{}' '+'
  VERSION="${VERSION}" ARCH="${ARCH}" /usr/local/bin/appimagetool \
    --verbose \
    --comp gzip \
    --no-appstream \
    "${APPDIR}" \
    output
}

build() {
  find_dependencies $(find "${APPDIR}/${INSTALLDIR}" -type f -exec sh -c 'readelf -h {} >/dev/null 2>&1' \; -print)
  build_appimage
}

build
