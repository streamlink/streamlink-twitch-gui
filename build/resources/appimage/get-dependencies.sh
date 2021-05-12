#!/usr/bin/env bash
set -e

DOCKER_IMAGE="${1}"
DOCKER_DIGEST="${2}"
INPUT="${3}"

declare -A DEPS=(
  [docker]=docker
  [jq]=jq
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

[[ $# == 3 ]] || err "Invalid arguments"

for dep in "${!DEPS[@]}"; do
  command -v "${dep}" 2>&1 >/dev/null || err "Missing dependency: ${DEPS["${dep}"]}"
done


# ----


DOCKER_SCRIPT=$(cat <<'EOF'
set -e

declare -A excludepackages=(
  [gtk3]=true
)

for pkg in $(repoquery --queryformat="%{name}" --requires --recursive --resolve "${!excludepackages[@]}" | sort -u); do
  excludepackages["${pkg}"]=true
done

declare -A excludelibraries
for lib in $(sed -e '/#.*/d; /^[[:space:]]*|[[:space:]]*$/d; /^$/d' /usr/local/share/appimage/excludelist); do
  excludelibraries["${lib}"]=true
done

find_dependencies() {
  declare -A libs
  for file in "$@"; do
    [[ -f "${file}" && -x "${file}" ]] || { echo >&2 "File does not exist or is not executable: ${file}"; exit 1; }

    for lib in $(LD_LIBRARY_PATH=$(dirname "${file}") ldd "${file}" | awk '/ => not found/ {print $1}'); do
      # don't check a lib more than once
      [[ -n "${excludelibraries["${lib}"]}" ]] && continue
      excludelibraries["${lib}"]=true

      # find the lib's package (for some reason, --file doesn't support selecting the package arch)
      local package=$(repoquery --queryformat="%{name}" --file "${lib}" | head -n1)

      [[ -z "${package}" ]] && { echo >&2 "Missing package for: ${lib}"; exit 1; }
      [[ -n "${excludepackages["${package}"]}" ]] && continue

      # resolve full package name with epoch, name, version, release and arch
      libs["${lib}"]=$(repoquery --envra "${package}.$(uname -m)")
    done
  done

  [[ ${#libs[@]} == 0 ]] && return

  yum install -q -y "${libs[@]}"

  for lib in "${!libs[@]}"; do
    for path in $(repoquery --list "${libs["${lib}"]}"); do
      if [[ "$(basename -- "${path}")" == "${lib}" ]]; then
        echo "${libs["${lib}"]}=${path}"
        find_dependencies "${path}"
      fi
    done
  done
}

find_dependencies $(find . -type f -exec sh -c 'readelf -h {} >/dev/null 2>&1' \; -print)
EOF
)

docker run \
  --interactive \
  --rm \
  --env SOURCE_DATE_EPOCH \
  --mount "type=bind,source=${INPUT},target=/app" \
  --workdir /app \
  "${DOCKER_IMAGE}@${DOCKER_DIGEST}" \
  /usr/bin/bash <<< "${DOCKER_SCRIPT}" \
  | jq -CRn '[(inputs | split("\n")) | .[]]'
