import { module, test } from "qunit";

import argvInjector from "inject-loader?nwjs/App!nwjs/argv";


module( "nwjs/argv" );


test( "Default values", assert => {

	const argv = argvInjector({
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
			"ARG_TRAY",
			"ARG_VERSIONCHECK"
		].sort(),
		"Exports the correct constants"
	);

});


test( "Custom parameters", assert => {

	const { argv } = argvInjector({
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
			"goto": "foo",
			"launch": "bar"
		},
		"Has the correct parameters"
	);

});


test( "Aliases", assert => {

	const { argv } = argvInjector({
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
			"goto": "",
			"launch": ""
		},
		"Has the correct parameters"
	);

});


test( "Parse command", assert => {

	const { parseCommand } = argvInjector({
		"nwjs/App": {
			argv: [],
			manifest: {
				"chromium-args": "--foo --bar"
			}
		}
	});

	assert.propEqual(
		// this is unfortunately how NW.js passes through the command line string from second
		// application starts: parameters with leading dashes get moved to the beginning
		parseCommand([
			"/path/to/executable",
			"--goto",
			"--unrecognized-parameter-name",
			"--foo",
			"--bar",
			"--user-data-dir=baz",
			"--no-sandbox",
			"--no-zygote",
			"--flag-switches-begin",
			"--flag-switches-end",
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
			"goto": "foo",
			"launch": ""
		},
		"Correctly parses parameters"
	);

});
