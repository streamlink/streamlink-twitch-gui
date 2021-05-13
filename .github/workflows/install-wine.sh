#!/usr/bin/env bash
set -e

[[ "${CI}" ]] || exit 1

set -x

# install wine (needed for building Windows releases)
sudo dpkg --add-architecture i386

# add apt repository for latest wine builds from winehq
curl -sSL https://dl.winehq.org/wine-builds/winehq.key | sudo apt-key add -
sudo apt-add-repository "deb https://dl.winehq.org/wine-builds/ubuntu/ focal main"

# install winehq-stable package
sudo apt-get update -qq
sudo apt-get install --install-recommends -y winehq-stable

# boot wine prefix without install popup and manually download+install wine-mono (would otherwise hang due to Xvfb)
WINEDLLOVERRIDES="mscoree,mshtml=" wineboot -i
curl -sSLO https://dl.winehq.org/wine/wine-mono/5.0.0/wine-mono-5.0.0-x86.msi
sha256sum -c <<< "17da208645a82a5e45e84fc75c73a8440acda484411cb8fae8e9b72db9886cd5  wine-mono-5.0.0-x86.msi"
wine msiexec /i wine-mono-5.0.0-x86.msi
