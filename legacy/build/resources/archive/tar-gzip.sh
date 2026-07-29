#!/usr/bin/env bash
set -e
set -o pipefail


input="$(realpath "${1}")"
output="$(realpath "${2}")"
prefix="${3}"
mtime="${4:-now}"
# let SOURCE_DATE_EPOCH override $4 if it is set
[ "${SOURCE_DATE_EPOCH}" ] && mtime="@${SOURCE_DATE_EPOCH}"

# ----

fail() {
  echo >&2 "$@"
  exit 1
}

[ -d "${input}" ] || fail Input directory does not exist
[ "${output}" ] || fail Missing output file
[ "${prefix}" ] || fail Missing archive prefix

tar --version | grep --quiet 'GNU tar' \
  || fail GNU tar is required for building tarballs with custom prefixes on the fly

# ----

# go into input dir
cd "${input}"

# include all files from the input dir
find . -type f -print0 \
  `# sort files deterministically` \
  | LC_ALL=C sort -z \
  `# create tarball` \
  | tar \
    --no-recursion \
    --null \
    --files-from - \
    `# explicitly set mtime and owner/group IDs+perms` \
    `# https://wiki.debian.org/ReproducibleBuilds/TimestampsInTarball` \
    "--mtime=${mtime}" \
    --numeric-owner --owner=0 --group=0 \
    --mode=go=rX,u+rw,a-s \
    `# use --transform feature of GNU tar to set the custom prefix path` \
    `# set flags=r to ignore prefix when archiving symlinks` \
    `# https://stackoverflow.com/a/29661783` \
    --transform "flags=r;s,^\./,${prefix}/," \
    `# PAX headers` \
    --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime \
    --create \
  `# compress tarball with pigz instead of gzip, so all CPU cores get utilized` \
  `# due to its parallelism, files created with pigz have a different checksum compared to gzip` \
  `# since we're declaring pigz as a build dependency now, this difference doesn't matter` \
  `# pigz is a simple drop-in replacement and everything is still deterministic` \
  | pigz \
    `# https://wiki.debian.org/ReproducibleBuilds/TimestampsInGzipHeaders` \
    --no-name \
    --best \
  `# finally write the stream of the compressed archive to the output file` \
  > "${output}"
