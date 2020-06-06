#!/usr/bin/env bash
set -e

[[ "${CI}" ]] || exit 1

set -x

# install wine (needed for building Windows releases)
sudo dpkg --add-architecture i386

# add apt repository for latest wine builds from winehq
curl -sSL https://dl.winehq.org/wine-builds/winehq.key | sudo apt-key add -
sudo apt-add-repository "deb http://dl.winehq.org/wine-builds/ubuntu/ bionic main"

# add apt repository for faudio workaround on bionic beaver
curl -sSL https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/Release.key | sudo apt-key add -
sudo apt-add-repository "deb https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/ ./"

# install winehq-stable package
sudo apt-get update -qq && sudo apt-get install -qq -o=Dpkg::Use-Pty=0 --install-recommends -y winehq-stable

# boot wine prefix without install popup and manually download+install wine-mono (would otherwise hang due to Xvfb)
WINEDLLOVERRIDES="mscoree,mshtml=" wineboot -i
curl -sSL -o /tmp/wine-mono-5.0.0-x86.msi https://dl.winehq.org/wine/wine-mono/5.0.0/wine-mono-5.0.0-x86.msi
wine msiexec /i /tmp/wine-mono-5.0.0-x86.msi
