#!/usr/bin/env bash
set -e


if [ -z "${BINTRAY_USER}" ] \
|| [ -z "${BINTRAY_KEY}" ] \
|| [ -z "${BINTRAY_PASSPHRASE}" ] \
|| [ -z "${BINTRAY_SUBJECT}" ] \
|| [ -z "${BINTRAY_REPO_DEB}" ] \
|| [ -z "${BINTRAY_REPO_RPM}" ]
then
	echo "Missing BINTRAY_* env vars" 1>&2
	exit 1
fi


# fixes https://github.com/travis-ci/dpl/issues/517
echo "Manually triggering a metadata recalculation on bintray"

url="https://api.bintray.com/calc_metadata"

# deb repo
curl \
	-s \
	"-u${BINTRAY_USER}:${BINTRAY_KEY}" \
	-H "Content-Type:application/json" \
	-H "Accept:application/json" \
	-X "POST" \
	"${url}/${BINTRAY_SUBJECT}/${BINTRAY_REPO_DEB}/" \
	-d "{\"passphrase\":\"${BINTRAY_PASSPHRASE}\"}" \
	> /dev/null \
	&& echo "Deb repo metadata recalculation queued"

# rpm repo
curl \
	-s \
	"-u${BINTRAY_USER}:${BINTRAY_KEY}" \
	-H "Content-Type:application/json" \
	-H "Accept:application/json" \
	-X "POST" \
	"${url}/${BINTRAY_SUBJECT}/${BINTRAY_REPO_RPM}/" \
	-d "{\"passphrase\":\"${BINTRAY_PASSPHRASE}\"}" \
	> /dev/null \
	&& echo "Rpm repo metadata recalculation queued"
