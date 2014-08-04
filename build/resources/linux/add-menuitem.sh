#!/bin/bash

DIR=`readlink -f $0`
HERE=`dirname $DIR`

TMP=`mktemp --directory`
DESKTOP=$TMP/livestreamer-twitch-gui.desktop

cat << EOF > $DESKTOP
[Desktop Entry]
Type=Application
Name=Livestreamer-Twitch-GUI
GenericName=Twitch.tv browser for livestreamer
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=livestreamer;twitch;
Categories=AudioVideo;
Exec=$HERE/start.sh
Icon=livestreamer-twitch-gui
EOF

xdg-desktop-menu install $DESKTOP
xdg-icon-resource install --size 16 "icons/icon-16.png" livestreamer-twitch-gui
xdg-icon-resource install --size 32 "icons/icon-32.png" livestreamer-twitch-gui
xdg-icon-resource install --size 48 "icons/icon-48.png" livestreamer-twitch-gui
xdg-icon-resource install --size 64 "icons/icon-64.png" livestreamer-twitch-gui
xdg-icon-resource install --size 128 "icons/icon-128.png" livestreamer-twitch-gui
xdg-icon-resource install --size 256 "icons/icon-256.png" livestreamer-twitch-gui

rm $DESKTOP
rm -R $TMP
