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

# ----

# create and go into a temp dir
tempdir=$(mktemp -d) && trap "rm -rf ${tempdir}" EXIT || exit 255
cd "${tempdir}"

# create the archive's prefix
mkdir "${prefix}"
# and copy all files
cp -a "${input}/." "${prefix}/"

# fix file permissions
find . -type d -exec chmod 0755 '{}' '+'
find . -type f -exec chmod 0644 '{}' '+'

# deterministic archive: update the mtime of all dirs and files and the prefix
# https://wiki.debian.org/ReproducibleBuilds/TimestampsInZip
find . -exec touch --no-dereference "--date=${mtime}" '{}' '+'

# include all files from the input dir via the prefix (mind the trailing /)
find "${prefix}/" \
  `# sort files deterministically` \
  | LC_ALL=C sort \
  `# create the compressed archive and write to the output file` \
  | TZ=UTC zip \
    --quiet \
    --latest-time \
    -9 \
    -X \
    -@ \
    "${output}"
