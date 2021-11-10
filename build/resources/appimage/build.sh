#!/usr/bin/env bash
set -e

# this build script is meant to be run by the dist:appimage_linux{32,64} grunt tasks
# don't run it directly unless you know what you're doing

NAME="${1}"
VERSION="${2}"
DOCKER_IMAGE="${3}"
DOCKER_DIGEST="${4}"
INPUT="${5}"
OUTPUT="${6}"

declare -A DEPS=(
  [docker]=docker
  [appstreamcli]=appstreamcli
  [appstream-util]=appstreamutil
)


# ----


SELF=$(basename "$(readlink -f "${0}")")
DOCKER_SCRIPT="$(dirname "$(readlink -f "${0}")")/build-docker.sh"

log() {
  echo "[${SELF}] $@"
}
err() {
  log >&2 "$@"
  exit 1
}

[[ $# -lt 6 ]] && err "Invalid arguments"
shift 6

for dep in "${!DEPS[@]}"; do
  command -v "${dep}" 2>&1 >/dev/null || err "Missing dependency: ${DEPS["${dep}"]}"
done

APPIMAGEDEPS=("${@}")


# ----


tempdir=$(mktemp -d) && trap "rm -rf ${tempdir}" EXIT || exit 255
cd "${tempdir}"

appdir="${NAME}.AppDir"
installdir="opt/${NAME}"


# ----


get_docker_image() {
  log "Getting docker image"
  docker image ls --digests "${DOCKER_IMAGE}" | grep "${DOCKER_DIGEST}" 2>&1 >/dev/null \
    || docker image pull "${DOCKER_IMAGE}@${DOCKER_DIGEST}"
}


prepare_appimage() {
  log "Installing AppDir files"

  # create AppImage AppDir
  mkdir -p "${appdir}/${installdir}"

  # copy app contents
  cp -a "${INPUT}/." "${appdir}/${installdir}/"

  # copy licenses
  install -Dm644 \
    -t "${appdir}/usr/share/licenses/${NAME}/" \
    "${appdir}/${installdir}/LICENSE.txt" \
    "${appdir}/${installdir}/credits.html"

  # copy appstream metainfo
  install -Dm644 \
    -t "${appdir}/usr/share/metainfo/" \
    "${appdir}/${installdir}/${NAME}.appdata.xml"

  # copy icons
  for res in 16 32 48 64 128 256; do
    install -Dm644 \
      "${appdir}/${installdir}/icons/icon-${res}.png" \
      "${appdir}/usr/share/icons/hicolor/${res}x${res}/apps/${NAME}.png"
  done

  # symlink root AppImage icons
  for link in "${appdir}/.DirIcon" "${appdir}/${NAME}.png"; do
    ln -sr "${appdir}/usr/share/icons/hicolor/256x256/apps/${NAME}.png" "${link}"
  done

  # create desktop file
  mkdir -p "${appdir}/usr/share/applications/"
  cat > "${appdir}/usr/share/applications/${NAME}.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Streamlink Twitch GUI
GenericName=Twitch.tv browser for Streamlink
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=streamlink;twitch;
Categories=AudioVideo;Network;
StartupWMClass=streamlink-twitch-gui
Exec=${NAME}
Icon=${NAME}
EOF

  # symlink root AppImage desktop file
  ln -sr "${appdir}/usr/share/applications/${NAME}.desktop" "${appdir}/${NAME}.desktop"

  # symlink executable
  mkdir -p "${appdir}/usr/bin"
  ln -sr "${appdir}/${installdir}/${NAME}" "${appdir}/usr/bin/${NAME}"

  # AppRun
  cat > "${appdir}/AppRun" <<EOF
#!/usr/bin/env bash
HERE=\$(dirname "\$(readlink -f "\${0}")")
export LD_LIBRARY_PATH="\${HERE}/${installdir}/lib\${LD_LIBRARY_PATH:+":\${LD_LIBRARY_PATH}"}"
"\${HERE}/usr/bin/${NAME}" "\${@}"
EOF
  chmod +x "${appdir}/AppRun"

  # remove unneeded stuff
  rm -rf \
    "${appdir}/${installdir}/"{add,remove}-menuitem.sh \
    "${appdir}/${installdir}/"{LICENSE.txt,credits.html} \
    "${appdir}/${installdir}/${NAME}.appdata.xml" \
    "${appdir}/${installdir}/icons/"
}


verify_appstream() {
  log "Verifying appstream data"
  appstreamcli validate-tree "${appdir}/usr/share/metainfo/${NAME}.appdata.xml"
  appstream-util validate-relax "${appdir}/usr/share/metainfo/${NAME}.appdata.xml"
}


build_appimage() {
  log "Building appimage inside container"
  local target=/build
  install -m755 -t "${tempdir}" "${DOCKER_SCRIPT}"
  docker run \
    --interactive \
    --rm \
    --env SOURCE_DATE_EPOCH \
    --mount "type=bind,source=${tempdir},target=${target}" \
    --workdir "${target}" \
    "${DOCKER_IMAGE}@${DOCKER_DIGEST}" \
    /usr/bin/bash <<EOF
set -e
trap "chown -R $(id -u):$(id -g) '${target}'" EXIT
"./$(basename -- "${DOCKER_SCRIPT}")" \
  "${appdir}" \
  "${installdir}" \
  "${VERSION}" \
  "${APPIMAGEDEPS[@]}"
EOF
  install -Dm755 "${tempdir}/output" "${OUTPUT}"
}


build() {
  prepare_appimage
  verify_appstream
  get_docker_image
  build_appimage
}

build
