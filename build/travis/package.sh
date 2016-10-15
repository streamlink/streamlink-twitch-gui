#!/usr/bin/env bash
set -e


# log each command
set -x

# make sure that the dist folder exists
mkdir -p dist

# travis "ubuntu trusty" workaround for wine
# wine is needed for manipulating the win32/win64 executables (nw-builder)
# try to be as quiet as possible
sudo dpkg --add-architecture i386
sudo apt-get update -qq
sudo apt-get -qq -o=Dpkg::Use-Pty=0 install -y wine >/dev/null 2>/dev/null

# compile the application and package it
grunt clean:dist dist:all
