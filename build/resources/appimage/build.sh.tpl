#!/usr/bin/env bash
set -e


name="<%= name %>"
version="<%= version %>"
arch="<%= arch %>"
source="<%= dirinput %>"
dest="<%= diroutput %>/<%= filename %>"
apprun="<%= appimagekit %>/<%= apprun %>"
appimagetool="<%= appimagekit %>/<%= appimagetool %>"

# ----

declare -A DEPS=(
  [mksquashfs]=mksquashfs
  [appstreamcli]=appstreamcli
  [appstreamutil]=appstream-util
)
for dep in "${!DEPS[@]}"; do
  ! declare "${dep}"="$(which "${DEPS["${dep}"]}" 2>/dev/null)" \
  && {
    echo &>2 "'${dep}' not found. Cannot build AppImage."
    exit 1
  }
done

# show versions of custom dependencies
echo "${mksquashfs}: $("${mksquashfs}" -version | head -n1)"
echo "${appstreamcli}: $("${appstreamcli}" --version)"
echo "${appstreamutil}: $("${appstreamutil}" --version)"

# ----

tempdir=$(mktemp -d) && trap "rm -rf ${tempdir}" EXIT || exit 255
cd "${tempdir}"

appdir="${tempdir}/${name}.AppDir"
installdir="${appdir}/opt/${name}/"

# ----

# extract appimagetool
install -m777 "${appimagetool}" "${tempdir}/appimagetool"
"${tempdir}/appimagetool" --appimage-extract >/dev/null
appimagetool="${tempdir}/squashfs-root/AppRun"

# replace its internal mksquashfs tool with the system's one
cat > "${tempdir}/squashfs-root/usr/lib/appimagekit/mksquashfs" <<EOF
#!/bin/sh
args=\$(echo "\$@" | sed -e 's/-mkfs-fixed-time 0//')
"${mksquashfs}" \${args}
EOF

# ----

# create AppImage AppDir
mkdir "${appdir}"

# copy root AppRun
install -m777 "${apprun}" "${appdir}/AppRun"

# copy app contents
mkdir -p "${installdir}"
cp -a "${source}/." "${installdir}/"

# create custom start script and unset PYTHONHOME env var
mkdir -p "${appdir}/usr/bin/"
cat > "${appdir}/usr/bin/${name}" <<EOF
#!/usr/bin/env bash
SELF=\$(readlink -f "\$0")
HERE=\${SELF%/*}

unset PYTHONHOME
"\${HERE}"/../../opt/${name}/${name} "\$@"
EOF
chmod +x "${appdir}/usr/bin/${name}"

# copy licenses
install -Dm644 \
  -t "${appdir}/usr/share/licenses/${name}/" \
  "${installdir}/LICENSE.txt" \
  "${installdir}/credits.html"

# copy appstream metainfo
install -Dm644 \
  -t "${appdir}/usr/share/metainfo/" \
  "${installdir}/${name}.appdata.xml"

# copy icons
for res in 16 32 48 64 128 256; do
  install -Dm644 \
    "${installdir}/icons/icon-${res}.png" \
    "${appdir}/usr/share/icons/hicolor/${res}x${res}/apps/${name}.png"
done

# symlink root AppImage icons
for link in "${appdir}/.DirIcon" "${appdir}/${name}.png"; do
  ln -sr "${appdir}/usr/share/icons/hicolor/256x256/apps/${name}.png" "${link}"
done

# create desktop file
mkdir -p "${appdir}/usr/share/applications/"
cat > "${appdir}/usr/share/applications/${name}.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Streamlink Twitch GUI
GenericName=Twitch.tv browser for Streamlink
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=streamlink;twitch;
Categories=AudioVideo;Network;
Exec=${name}
Icon=${name}
EOF

# symlink root AppImage desktop file
ln -sr "${appdir}/usr/share/applications/${name}.desktop" "${appdir}/${name}.desktop"

# remove unneeded stuff
rm -r "${installdir}/"{{add,remove}-menuitem.sh,LICENSE.txt,credits.html,"${name}.appdata.xml",icons/}

# ----

# verify metainfo xml with system appstream binaries
(
  set -x
  "${appstreamcli}" validate-tree "${appdir}/usr/share/metainfo/${name}.appdata.xml"
  "${appstreamutil}" validate-relax "${appdir}/usr/share/metainfo/${name}.appdata.xml"
)

# build AppImage
(
  set -x
  ARCH="${arch}" VERSION="${version}" "${appimagetool}" \
    --verbose \
    --comp gzip \
    --no-appstream \
    "${appdir}" \
    "${dest}"
)
chmod +x "${dest}"
