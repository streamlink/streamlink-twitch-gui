#!/usr/bin/env bash
set -e

[[ "${CI}" ]] || exit 1

set -x

source /etc/os-release

# Get rid of packages installed from ppa:ondrej/php, so that wine32:i386 can be installed without conflicts
# https://github.com/actions/virtual-environments/issues/4589
# https://github.com/actions/virtual-environments/blob/ubuntu20/20220717.1/images/linux/scripts/installers/php.sh
# 1. Remove all packages that ppa:ondrej/php has but plain Ubuntu doesn't: everything PHP, libpcre2-posix3, libzip4
dpkg -l | awk '$1 == "ii" && index($3, "deb.sury.org") > 0 && $2 ~ /^php/ { print $2 }' \
  | xargs -t sudo apt-get remove libpcre2-posix3 libzip4
# 2. Revert remaining packages that ppa:ondrej/php and plain Ubuntu share back to the plain Ubuntu version
dpkg -l | awk -v "CODENAME=${UBUNTU_CODENAME}" '$1 == "ii" && index($3, "deb.sury.org") > 0 { print $2 "/" CODENAME }' \
  | xargs -rt sudo apt-get install --no-install-recommends --allow-downgrades -V
# 3. Assert that no packages from ppa:ondrej/php are left installed
! dpkg -l | grep '^ii' | fgrep 'deb.sury.org'

# add i386 architecture
sudo dpkg --add-architecture i386

# install wine-stable from the regular Ubuntu package repositories
sudo apt-get update
sudo apt-get install --no-install-recommends wine-stable wine32:i386

# boot wine prefix without install popup
WINEDLLOVERRIDES="mscoree,mshtml=" wineboot -i
wineserver --wait

# manually download+install wine-mono (would otherwise hang due to Xvfb)
# more recent versions of wine-mono will break anolis-resourcer which is used by nw-builder
# for replacing the application's embedded icon bitmaps in the executable
curl -SLO https://dl.winehq.org/wine/wine-mono/5.0.0/wine-mono-5.0.0-x86.msi
sha256sum -c <<< "17da208645a82a5e45e84fc75c73a8440acda484411cb8fae8e9b72db9886cd5  wine-mono-5.0.0-x86.msi"
wine msiexec /i wine-mono-5.0.0-x86.msi
wineserver --wait
rm -f wine-mono-5.0.0-x86.msi
