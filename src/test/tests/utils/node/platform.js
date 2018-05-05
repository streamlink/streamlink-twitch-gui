import { module, test } from "qunit";
import { posix as pathPosix, win32 as pathWin32 } from "path";

import platformInjector from "inject-loader?-semver!utils/node/platform";


module( "utils/node/platform", {
	beforeEach() {
		this.env = Object.assign( {}, process.env );
	},
	afterEach() {
		process.env = this.env;
	}
});


test( "Windows", function( assert ) {

	const {
		isWin,
		isDarwin,
		isLinux,
		isWin7,
		isWinGte8,
		is64bit,
		cachedir,
		datadir,
		logdir
	} = platformInjector({
		os: {
			platform: () => "win32",
			release: () => "6.2.0",
			arch: () => "x64",
			homedir: () => "C:\\Users\\user",
			tmpdir: () => "C:\\Users\\user\\AppData\\Local\\Temp"
		},
		path: pathWin32,
		config: {
			main: {
				"app-identifier": "my-app"
			}
		}
	});

	assert.ok( isWin, "Is Windows" );
	assert.notOk( isDarwin, "Is not macOS" );
	assert.notOk( isLinux, "Is not Linux" );
	assert.notOk( isWin7, "Is not Windows 7" );
	assert.ok( isWinGte8, "Is Windows greater than or equal 8" );
	assert.ok( is64bit, "Is 64 bit" );

	assert.strictEqual(
		cachedir,
		"C:\\Users\\user\\AppData\\Local\\Temp\\my-app\\cache",
		"Cache dir"
	);
	assert.strictEqual(
		datadir,
		"C:\\Users\\user\\AppData\\Local\\Temp\\my-app\\data",
		"Data dir"
	);
	assert.strictEqual(
		logdir,
		"C:\\Users\\user\\AppData\\Local\\Temp\\my-app\\logs",
		"Log dir"
	);

});


test( "Windows 7", function( assert ) {

	const {
		isWin,
		isWin7,
		isWinGte8,
		is64bit
	} = platformInjector({
		os: {
			platform: () => "win32",
			release: () => "6.1.0",
			arch: () => "x86",
			homedir: () => "C:\\Users\\user",
			tmpdir: () => "C:\\Users\\user\\AppData\\Local\\Temp"
		},
		path: pathWin32,
		config: {
			main: {
				"app-identifier": "my-app"
			}
		}
	});

	assert.ok( isWin, "Is Windows" );
	assert.ok( isWin7, "Is Windows 7" );
	assert.notOk( isWinGte8, "Is not Windows greater than or equal 8" );
	assert.notOk( is64bit, "Is 32 bit" );

});


test( "macOS", function( assert ) {

	const {
		isWin,
		isDarwin,
		isLinux,
		isWin7,
		isWinGte8,
		is64bit,
		cachedir,
		datadir,
		logdir
	} = platformInjector({
		os: {
			platform: () => "darwin",
			release: () => "17.0.0",
			arch: () => "x64",
			homedir: () => "/Users/user",
			tmpdir: () => "/tmp"
		},
		path: pathPosix,
		config: {
			main: {
				"app-identifier": "my-app"
			}
		}
	});

	assert.notOk( isWin, "Is not Windows" );
	assert.ok( isDarwin, "Is macOS" );
	assert.notOk( isLinux, "Is not Linux" );
	assert.notOk( isWin7, "Is not Windows 7" );
	assert.notOk( isWinGte8, "Is not Windows greater than or equal 8" );
	assert.ok( is64bit, "Is 64 bit" );

	assert.strictEqual(
		cachedir,
		"/Users/user/Library/Caches/my-app",
		"Cache dir"
	);
	assert.strictEqual(
		datadir,
		"/Users/user/Library/my-app",
		"Data dir"
	);
	assert.strictEqual(
		logdir,
		"/Users/user/Library/Logs/my-app",
		"Log dir"
	);

});


test( "Linux", function( assert ) {

	const {
		isWin,
		isDarwin,
		isLinux,
		isWin7,
		isWinGte8,
		is64bit,
		cachedir,
		datadir,
		logdir
	} = platformInjector({
		os: {
			platform: () => "linux",
			release: () => "4.16.5",
			arch: () => "x64",
			homedir: () => "/home/user",
			tmpdir: () => "/tmp"
		},
		path: pathPosix,
		config: {
			main: {
				"app-identifier": "my-app"
			}
		}
	});

	assert.notOk( isWin, "Is not Windows" );
	assert.notOk( isDarwin, "Is not macOS" );
	assert.ok( isLinux, "Is Linux" );
	assert.notOk( isWin7, "Is not Windows 7" );
	assert.notOk( isWinGte8, "Is not Windows greater than or equal 8" );
	assert.ok( is64bit, "Is 64 bit" );

	assert.strictEqual(
		cachedir,
		"/home/user/.cache/my-app",
		"Cache dir"
	);
	assert.strictEqual(
		datadir,
		"/home/user/.local/share/my-app/data",
		"Data dir"
	);
	assert.strictEqual(
		logdir,
		"/home/user/.local/share/my-app/logs",
		"Log dir"
	);

});


test( "Linux with XDG env vars", function( assert ) {

	process.env.XDG_CACHE_HOME = "/foo";
	process.env.XDG_DATA_HOME = "/bar";

	const {
		cachedir,
		datadir,
		logdir
	} = platformInjector({
		os: {
			platform: () => "linux",
			release: () => "4.16.5",
			arch: () => "x64",
			homedir: () => "/home/user",
			tmpdir: () => "/tmp"
		},
		path: pathPosix,
		config: {
			main: {
				"app-identifier": "my-app"
			}
		}
	});

	assert.strictEqual(
		cachedir,
		"/foo/my-app",
		"Cache dir"
	);
	assert.strictEqual(
		datadir,
		"/bar/my-app/data",
		"Data dir"
	);
	assert.strictEqual(
		logdir,
		"/bar/my-app/logs",
		"Log dir"
	);

});
