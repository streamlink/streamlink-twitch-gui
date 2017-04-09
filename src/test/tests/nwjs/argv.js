import {
	module,
	test
} from "qunit";
import argvInjector from "inject-loader?nwjs/nwGui!nwjs/argv";


module( "nwjs/argv" );


test( "Default values", assert => {

	const argv = argvInjector({
		"nwjs/nwGui": {
			App: {
				fullArgv: []
			}
		}
	});

	const {
		tray,
		max,
		min,
		resetwindow,
		versioncheck,
		loglevel,
		logfile
	} = argv;

	assert.deepEqual(
		argv[ "default" ],
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
			"reset-window": false,
			"versioncheck": true,
			"logfile": true,
			"loglevel": "",
			"l": ""
		},
		"Has the correct parameters"
	);

	assert.deepEqual(
		Object.keys( argv ).sort(),
		[
			"default",
			"tray",
			"max",
			"min",
			"resetwindow",
			"versioncheck",
			"logfile",
			"loglevel"
		].sort(),
		"Exports the correct constants"
	);

	assert.strictEqual( tray, false, "Exports the tray parameter" );
	assert.strictEqual( max, false, "Exports the max parameter" );
	assert.strictEqual( min, false, "Exports the min parameter" );
	assert.strictEqual( resetwindow, false, "Exports the resetwindow parameter" );
	assert.strictEqual( versioncheck, true, "Exports the versioncheck parameter" );
	assert.strictEqual( logfile, true, "Exports the logfile parameter" );
	assert.strictEqual( loglevel, "", "Exports the loglevel parameter" );

});


test( "Custom parameters", assert => {

	const argv = argvInjector({
		"nwjs/nwGui": {
			App: {
				fullArgv: [
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
					"debug"
				]
			}
		}
	});

	const {
		tray,
		max,
		min,
		resetwindow,
		versioncheck,
		loglevel,
		logfile
	} = argv;

	assert.deepEqual(
		argv[ "default" ],
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
			"reset-window": true,
			"versioncheck": false,
			"logfile": false,
			"loglevel": "debug",
			"l": "debug"
		},
		"Has the correct parameters"
	);

	assert.strictEqual( tray, true, "Exports the tray parameter" );
	assert.strictEqual( max, true, "Exports the max parameter" );
	assert.strictEqual( min, true, "Exports the min parameter" );
	assert.strictEqual( resetwindow, true, "Exports the resetwindow parameter" );
	assert.strictEqual( versioncheck, false, "Exports the versioncheck parameter" );
	assert.strictEqual( logfile, false, "Exports the logfile parameter" );
	assert.strictEqual( loglevel, "debug", "Exports the loglevel parameter" );

});


test( "Aliases", assert => {

	const argv = argvInjector({
		"nwjs/nwGui": {
			App: {
				fullArgv: [
					"--hide",
					"--maximize",
					"--minimize",
					"-l",
					"debug"
				]
			}
		}
	});

	const {
		tray,
		max,
		min,
		loglevel
	} = argv;

	assert.deepEqual(
		argv[ "default" ],
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
			"reset-window": false,
			"versioncheck": true,
			"logfile": true,
			"loglevel": "debug",
			"l": "debug"
		},
		"Has the correct parameters"
	);

	assert.strictEqual( tray, true, "Exports the tray parameter" );
	assert.strictEqual( max, true, "Exports the max parameter" );
	assert.strictEqual( min, true, "Exports the min parameter" );
	assert.strictEqual( loglevel, "debug", "Exports the loglevel parameter" );

});
