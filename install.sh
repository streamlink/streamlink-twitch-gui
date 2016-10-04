#!/usr/bin/env bash
set -e

# --------------------------------------------------
# Streamlink Twitch GUI - deb/rpm installer script
# --------------------------------------------------

# This bash script is meant for installing Streamlink Twitch GUI on various Linux distributions
# and registering its custom package repository for deb/rpm based package managers.
#
# If you're not using Linux or if your Linux distribution is using a different package format,
# please see the detailed installation guide in the project's wiki:
# https://github.com/streamlink/streamlink-twitch-gui/wiki


# Usage:
# Download this script, chmod +x and execute it or run one of the following commands:
# curl -sSL https://raw.githubusercontent.com/streamlink/streamlink-twitch-gui/master/install.sh | bash
# wget -qO- https://raw.githubusercontent.com/streamlink/streamlink-twitch-gui/master/install.sh | bash
#
# Please report any issues here (pull requests with improvements are also welcome):
# https://github.com/streamlink/streamlink-twitch-gui/issues
#
# Acknowledgements to the creators of the install scripts of nodejs and docker:
# https://github.com/nodesource/distributions
# License: MIT
# https://github.com/docker/docker
# License: Apache 2.0


NAME="Streamlink Twitch GUI"
REPO_NAME="streamlink-twitch-gui"
PKG="streamlink-twitch-gui"

URL_HELP="https://github.com/streamlink/streamlink-twitch-gui/wiki/Installation"

REPO_URL_DEB="https://dl.bintray.com/streamlink-twitch-gui/deb"
REPO_URL_RPM="https://dl.bintray.com/streamlink-twitch-gui/rpm"

GPG_KEY_URL="https://bintray.com/user/downloadSubjectPublicKey?username=streamlink-twitch-gui"

DEB_DISTRIBUTION="stable"
DEB_COMPONENT="main"

# lsb_release -si | tr "[:upper:]" "[:lower:]"
LIST_DEB=("debian" "ubuntu" "linuxmint" "lmde" "elementaryos" "steamos")
LIST_RPM=("redhat" "fedora" "opensuse")


# ==================================================================================================


print_msg() {
	cat <<-EOF

	  # ${@}

	EOF
	sleep 1
}

print_error() {
	cat >&2 <<-EOF

	  Error: ${@}

	EOF
	exit 1
}

containsElement() {
	local e
	for e in "${@:2}"; do [[ "$e" = "$1" ]] && return 0; done
	return 1
}

command_exists() {
	command -v "${@}" > /dev/null 2>&1
}


setup() {
	# simple architecture check
	if ! $(uname -m | grep -Eq "^((amd|x86_)64|i[3-6]86)\$"); then
		print_error "Invalid CPU architecture."
	fi

	# command for elevated privileges
	run="sh -c"
	if [ "$(id -un 2>/dev/null || true)" != "root" ]; then
		if command_exists "sudo"; then
			run="sudo -E sh -c"
		elif command_exists "su"; then
			run="su -c"
		else
			print_error "Unable to gain root privileges."
		fi
	fi

	# download method
	download=""
	if command_exists "curl"; then
		download="curl -sSL"
	elif command_exists "wget"; then
		download="wget -qO-"
	fi


	# get distro ID
	distro=""
	if command_exists "lsb_release"; then
		distro="$(lsb_release -si)"
	fi
	if [ -z "${distro}" ] && [ -r /etc/lsb-release ]; then
		distro="$(source /etc/lsb-release && echo "${DISTRIB_ID}")"
	fi
	if [ -z "${distro}" ] && [ -r /etc/os-release ]; then
		distro="$(source /etc/os-release && echo "${ID}")"
	fi
	distro="$(echo "${distro}" | tr "[:upper:]" "[:lower:]")"

	# compare with known distros
	type=""
	if containsElement "${distro}" "${LIST_DEB[@]}"; then
		type="deb"
	elif containsElement "${distro}" "${LIST_RPM[@]}"; then
		type="rpm"
	fi

	# distro fallbacks
	if [ -z "${type}" ] && [ -r /etc/debian_version ]; then
		type="deb"
	fi
	if [ -z "${type}" ] && [ -r /etc/fedora-release ]; then
		type="rpm"
	fi
	if [ -z "${type}" ] && [ -r /etc/redhat-release ]; then
		type="rpm"
	fi


	# DEB based
	if [ "${type}" = "deb" ]; then
		export DEBIAN_FRONTEND=noninteractive

		PRE_INSTALL_PKGS=""
		if [ ! -e /usr/lib/apt/methods/https ]; then
			PRE_INSTALL_PKGS="${PRE_INSTALL_PKGS} apt-transport-https ca-certificates"
		fi
		if ! command_exists "curl" && ! command_exists "wget"; then
			PRE_INSTALL_PKGS="${PRE_INSTALL_PKGS} curl ca-certificates"
			download="curl -sSL"
		fi
		if [ -n "${PRE_INSTALL_PKGS}" ]; then
			print_msg "Installing required packages by this installer script."
			(
				set -x
				${run} "apt-get update -qq; apt-get -q install -y${PRE_INSTALL_PKGS}"
			)
		fi

		print_msg "Setting up the deb repository now..."

		repopath="/etc/apt/sources.list.d"
		content="deb ${REPO_URL_DEB} ${DEB_DISTRIBUTION} ${DEB_COMPONENT}"
		(
			set -x
			${run} "${download} ${GPG_KEY_URL} | apt-key add -"
			${run} "mkdir -p ${repopath} && echo \"${content}\" > ${repopath}/${REPO_NAME}.list"
			${run} "apt-get update -qq; apt-get -q install -y ${PKG}"
		)

		print_msg "${NAME} has been successfully installed."
		exit 0

	# RPM based
	elif [ "${type}" = "rpm" ]; then
		repopath="/etc/yum.repos.d"
		if command_exists "zypper"; then
			repopath="/etc/zypp/repos.d"
			install="zypper refresh; zypper install ${PKG}"
		elif command_exists "dnf"; then
			install="dnf install ${PKG}"
		elif command_exists "yum"; then
			install="yum install ${PKG}"
		else
			print_error "Could not find your RPM-based package manager."
		fi

		print_msg "Setting up the rpm repository now..."

		(
			set -x
			${run} "mkdir -p ${repopath} && cat >${repopath}/${REPO_NAME}.repo" <<-EOF
				[${REPO_NAME}]
				enabled=1
				name=${NAME} repository
				baseurl=${REPO_URL_RPM}
				repo_gpgcheck=0
				gpgcheck=1
				gpgkey=${GPG_KEY_URL}
			EOF
			${run} "${install}"
		)

		print_msg "${NAME} has been successfully installed."
		exit 0
	fi

	cat >&2 <<-EOF

	  Either your distribution is not easily detectable or is not supported by
	  this installer script (pull requests with improvements are welcome).
	  Please visit the following URL for more detailed installation instructions:

	    ${URL_HELP}

	EOF
	exit 1
}

# defer setup until we have the complete script
setup
