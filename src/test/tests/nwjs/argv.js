import { module, test } from "qunit";

import { posix as pathPosix, win32 as pathWin32 } from "path";

import argvInjector from "inject-loader?nwjs/App&path!nwjs/argv";


module( "nwjs/argv" );


test( "Default values", assert => {

	const argv = argvInjector({
		"path": pathPosix,
		"nwjs/App": {
			argv: []
		}
	});

	assert.propEqual(
		argv.argv,
		{
			"_": [],
			"tray": false,
			"hide": false,
			"hidden": false,
			"max": false,
			"maximize": false,
			"maximized": false,
			"min": false,
			"minimize": false,
			"minimized": false,
			"reset-window": false,
			"versioncheck": true,
			"version-check": true,
			"logfile": true,
			"loglevel": "",
			"l": "",
			"theme": "",
			"goto": "",
			"launch": ""
		},
		"Has the correct parameters"
	);

	assert.deepEqual(
		Object.keys( argv ).sort(),
		[
			"argv",
			"parseCommand",
			"ARG_GOTO",
			"ARG_LAUNCH",
			"ARG_LOGFILE",
			"ARG_LOGLEVEL",
			"ARG_MAX",
			"ARG_MIN",
			"ARG_RESET_WINDOW",
			"ARG_THEME",
			"ARG_TRAY",
			"ARG_VERSIONCHECK"
		].sort(),
		"Exports the correct constants"
	);

});


test( "Custom parameters", assert => {

	const { argv } = argvInjector({
		"path": pathPosix,
		"nwjs/App": {
			argv: [
				// boolean without values
				"--tray",
				"--max",
				"--min",
				"--reset-window",
				// boolean with "no-" prefix
				"--no-versioncheck",
				// boolean with value
				"--logfile=false",
				// string
				"--loglevel",
				"debug",
				"--theme",
				"dark",
				"--goto",
				"foo",
				"--launch",
				"bar",
				"positional"
			]
		}
	});

	assert.propEqual(
		argv,
		{
			"_": [ "positional" ],
			"tray": true,
			"hide": true,
			"hidden": true,
			"max": true,
			"maximize": true,
			"maximized": true,
			"min": true,
			"minimize": true,
			"minimized": true,
			"reset-window": true,
			"versioncheck": false,
			"version-check": false,
			"logfile": false,
			"loglevel": "debug",
			"l": "debug",
			"theme": "dark",
			"goto": "foo",
			"launch": "bar"
		},
		"Has the correct parameters"
	);

});


test( "Aliases", assert => {

	const { argv } = argvInjector({
		"path": pathPosix,
		"nwjs/App": {
			argv: [
				"--hide",
				"--maximize",
				"--minimize",
				"--no-version-check",
				"-l",
				"debug"
			]
		}
	});

	assert.propEqual(
		argv,
		{
			"_": [],
			"tray": true,
			"hide": true,
			"hidden": true,
			"max": true,
			"maximize": true,
			"maximized": true,
			"min": true,
			"minimize": true,
			"minimized": true,
			"reset-window": false,
			"versioncheck": false,
			"version-check": false,
			"logfile": true,
			"loglevel": "debug",
			"l": "debug",
			"theme": "",
			"goto": "",
			"launch": ""
		},
		"Has the correct parameters"
	);

});


test( "Parse command on Linux", assert => {

	const { parseCommand } = argvInjector({
		"path": pathPosix,
		"nwjs/App": {
			argv: [],
			manifest: {
				"chromium-args": "--foo --bar"
			},
			dataPath: "/home/user/.config/appname/Default"
		}
	});

	assert.propEqual(
		parseCommand([
			"/path/to/executable",
			"--goto",
			"--unrecognized-parameter-name",
			"--foo",
			"--bar",
			"--user-data-dir=/home/user/.config/appname",
			"--no-sandbox",
			"--no-zygote",
			"--flag-switches-begin",
			"--flag-switches-end",
			"--nwapp=/tmp/nwjs-tmp",
			"--file-url-path-alias=/gen=/path/to/app/gen",
			"foo"
		].join( " " ) ),
		{
			"_": [],
			"tray": false,
			"hide": false,
			"hidden": false,
			"max": false,
			"maximize": false,
			"maximized": false,
			"min": false,
			"minimize": false,
			"minimized": false,
			"reset-window": false,
			"versioncheck": true,
			"version-check": true,
			"logfile": true,
			"loglevel": "",
			"l": "",
			"theme": "",
			"goto": "foo",
			"launch": ""
		},
		"Correctly parses parameters"
	);

});


test( "Parse command on macOS", assert => {

	const { parseCommand } = argvInjector({
		"path": pathPosix,
		"nwjs/App": {
			argv: [],
			manifest: {
				"chromium-args": "--foo --bar"
			},
			dataPath: "/Users/user/Library/Application Support/appname/Default"
		}
	});

	assert.propEqual(
		parseCommand([
			"/Applications/appname.app/Contents/MacOS/nwjs",
			"--goto",
			"--unrecognized-parameter-name",
			"--foo",
			"--bar",
			"--user-data-dir=/Users/user/Library/Application Support/appname",
			"--no-sandbox",
			"--no-zygote",
			"--flag-switches-begin",
			"--flag-switches-end",
			"--nwapp=/Applications/appname.app/Contents/Resources/app.nw",
			"--file-url-path-alias=/gen=/path/to/app/gen",
			"foo"
		].join( " " ) ),
		{
			"_": [],
			"tray": false,
			"hide": false,
			"hidden": false,
			"max": false,
			"maximize": false,
			"maximized": false,
			"min": false,
			"minimize": false,
			"minimized": false,
			"reset-window": false,
			"versioncheck": true,
			"version-check": true,
			"logfile": true,
			"loglevel": "",
			"l": "",
			"theme": "",
			"goto": "foo",
			"launch": ""
		},
		"Correctly parses parameters"
	);

});


test( "Parse command on Windows", assert => {

	const { parseCommand } = argvInjector({
		"path": pathWin32,
		"nwjs/App": {
			argv: [],
			manifest: {
				"chromium-args": "--foo --bar"
			},
			dataPath: "C:\\foo bar\\baz\\Default"
		}
	});

	assert.propEqual(
		parseCommand([
			"\"C:\\path\\to\\executable\"",
			"--goto",
			"--unrecognized-parameter-name",
			"--foo",
			"--bar",
			"--user-data-dir=\"C:\\foo bar\\baz\"",
			"--no-sandbox",
			"--no-zygote",
			"--flag-switches-begin",
			"--flag-switches-end",
			"--nwapp=\"C:\\qux quux\"",
			"--file-url-path-alias=\"gen=C:\\path\\to\\\\gen\"",
			"--original-process-start-time=123456789",
			"foo"
		].join( " " ) ),
		{
			"_": [],
			"tray": false,
			"hide": false,
			"hidden": false,
			"max": false,
			"maximize": false,
			"maximized": false,
			"min": false,
			"minimize": false,
			"minimized": false,
			"reset-window": false,
			"versioncheck": true,
			"version-check": true,
			"logfile": true,
			"loglevel": "",
			"l": "",
			"theme": "",
			"goto": "foo",
			"launch": ""
		},
		"Correctly parses parameters"
	);

});
