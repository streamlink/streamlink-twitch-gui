#!/usr/bin/env bash
set -e

[[ "${CI}" ]] || exit 1

set -x

# add i386 architecture
sudo dpkg --add-architecture i386

# fix version conflicts of certain library dependencies on GitHub's Ubuntu focal CI runner
# this uninstalls some packages which we don't care about
# https://github.com/actions/virtual-environments/issues/4589
sudo apt-get update
sudo apt-get install -y --allow-downgrades libpcre2-8-0=10.34-7

# install wine-stable from the regular Ubuntu package repositories
sudo apt-get update
sudo apt-get install --no-install-recommends -y wine-stable wine32

# boot wine prefix without install popup
WINEDLLOVERRIDES="mscoree,mshtml=" wineboot -i
wineserver --wait

# manually download+install wine-mono (would otherwise hang due to Xvfb)
# more recent versions of wine-mono will break anolis-resourcer which is used by nw-builder
# for replacing the application's embedded icon bitmaps in the executable
curl -sSLO https://dl.winehq.org/wine/wine-mono/5.0.0/wine-mono-5.0.0-x86.msi
sha256sum -c <<< "17da208645a82a5e45e84fc75c73a8440acda484411cb8fae8e9b72db9886cd5  wine-mono-5.0.0-x86.msi"
wine msiexec /i wine-mono-5.0.0-x86.msi
wineserver --wait
rm -f wine-mono-5.0.0-x86.msi
