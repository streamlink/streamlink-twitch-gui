#!/bin/bash

# This is a fix for node-webkit applications which fail to run because of
# the missing libudev library version on some linux distributions
# https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0

# name of the executable
EXEC="livestreamer-twitch-gui"


########


DIR=`readlink -f $0`
HERE=`dirname $DIR`

# check for the missing libudev library version
if [[ ! -z `ldd $HERE/$EXEC | grep "libudev.so.0 => not found"` ]]; then

	# check for an existing softlink
	if [[ ! -e "$HERE/libudev.so.0" ]]; then
		PATHS=(
			"/lib/x86_64-linux-gnu" # Ubuntu, Xubuntu, Mint
			"/usr/lib64" # SUSE, Fedora
			"/lib64" # Gentoo
			"/lib/i386-linux-gnu" # Ubuntu 32bit
			"/usr/lib" # Arch, Fedora 32bit
			"/lib32" # Gentoo 32bit
			"/usr/lib32" # Gentoo 32bit alternative
		)
		for i in "${PATHS[@]}"; do
			i="$i/libudev.so.1"
			if [[ -f $i ]]; then
				# create the softlink to the needed library
				ln -sf "$i" $HERE/libudev.so.0
				break
			fi
		done
	fi

	# prioritize to load the linked library from this directory
	if [[ -n "$LD_LIBRARY_PATH" ]]; then
		LD_LIBRARY_PATH="$HERE:$LD_LIBRARY_PATH"
	else
		LD_LIBRARY_PATH="$HERE"
	fi
	export LD_LIBRARY_PATH

fi

# run the application
exec -a "$0" "$HERE/$EXEC" "$@"
