#!/bin/bash

DIR=$(dirname $(readlink -f $0))
cd $DIR
if git rev-parse 2>/dev/null; then
  cd $(git rev-parse --show-toplevel)
else
  cd "../../.."
fi

RES=$(realpath build/resources/)
TMP=`mktemp --directory`
DESKTOP=$TMP/livestreamer-twitch-gui.desktop

cat << EOF > $DESKTOP
[Desktop Entry]
Type=Application
Name=Livestreamer Twitch GUI
GenericName=Twitch.tv browser for livestreamer
Comment=Browse Twitch.tv and watch streams in your videoplayer of choice
Keywords=livestreamer;twitch;
Categories=AudioVideo;
Exec=$RES/linux/start.sh
Icon=livestreamer-twitch-gui
EOF

xdg-desktop-menu install $DESKTOP
xdg-icon-resource install --size 16 "$RES/icons/icon-16.png" livestreamer-twitch-gui
xdg-icon-resource install --size 32 "$RES/icons/icon-32.png" livestreamer-twitch-gui
xdg-icon-resource install --size 48 "$RES/icons/icon-48.png" livestreamer-twitch-gui
xdg-icon-resource install --size 64 "$RES/icons/icon-64.png" livestreamer-twitch-gui
xdg-icon-resource install --size 128 "$RES/icons/icon-128.png" livestreamer-twitch-gui
xdg-icon-resource install --size 256 "$RES/icons/icon-256.png" livestreamer-twitch-gui

rm $DESKTOP
rm -R $TMP
