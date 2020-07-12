#!/usr/bin/env bash
set -e

[[ "${CI}" ]] || exit 1

tempdir=$(mktemp -d) && trap "rm -rf ${tempdir}" EXIT || exit 255
cd "${tempdir}"

COMMIT="c570c6188811088b12ffdd9665487a2960c997a0"
CHECKSUM="3d9721507fd3ab53e5831f2a2076e8801fb33c2e2cfa86a5ab4dcb3720375e0c"

curl -SL -o squashfs-tools.tar.gz "https://github.com/plougher/squashfs-tools/archive/${COMMIT}.tar.gz"
echo "${CHECKSUM}  squashfs-tools.tar.gz" | sha256sum -c

tar -xzvf squashfs-tools.tar.gz
cd "./squashfs-tools-${COMMIT}/squashfs-tools/"

set -x

sudo apt install make libattr1-dev zlib1g-dev
make \
  GZIP_SUPPORT=1 \
  XZ_SUPPORT=0 \
  LZO_SUPPORT=0 \
  LZMA_XZ_SUPPORT=0 \
  LZ4_SUPPORT=0 \
  ZSTD_SUPPORT=0 \
  XATTR_SUPPORT=1
sudo make install \
  INSTALL_DIR=/usr/local/bin
