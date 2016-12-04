#!/usr/bin/env bash

# ---------------------------------------------------
# Streamlink Twitch GUI - application launch script
# ---------------------------------------------------


# enable/disable new version check
CHECKNEWVERSIONS=true


# ==================================================================================================


EXEC="streamlink-twitch-gui"
DIR=$(readlink -f "${0}")
HERE=$(dirname "${DIR}")


command_exists() {
	command -v "${@}" >/dev/null 2>&1
}


# fix missing libudev
if command_exists "ldd" \
&& ldd "${HERE}/${EXEC}" 2>&1 >/dev/null | grep "libudev.so.0 => not found"
then
	if [ ! -e "${HERE}/libudev.so.0" ]; then
		libpaths=(
			"/lib/x86_64-linux-gnu"
			"/usr/lib64"
			"/lib64"
			"/usr/lib"
			"/lib/i386-linux-gnu"
			"/usr/lib32"
			"/lib32"
		)
		for libpath in "${libpaths[@]}"; do
			libpath="${libpath}/libudev.so.1"
			if [ -f "${libpath}" ]; then
				ln -sf "${libpath}" "${HERE}/libudev.so.0"
				break
			fi
		done
	fi

	if [ -n "${LD_LIBRARY_PATH}" ]; then
		LD_LIBRARY_PATH="${HERE}:${LD_LIBRARY_PATH}"
	else
		LD_LIBRARY_PATH="${HERE}"
	fi
	export LD_LIBRARY_PATH
fi


# application parameters
[ ${CHECKNEWVERSIONS} = true ] && params="${@}" || params="${@} --no-version-check"


# run the application
exec -a "${0}" "${HERE}/${EXEC}" ${params}
