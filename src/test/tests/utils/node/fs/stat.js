import {
	module,
	test
} from "qunit";
import statInjector from "inject-loader!utils/node/fs/stat";


module( "utils/node/fs/stat" );


test( "Without callback", async assert => {

	assert.expect( 9 );

	let fail = true;

	const statsObj = {};

	const { stat } = statInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": {},
		"path": {
			resolve( path ) {
				assert.strictEqual( path, "/foo/bar", "Resolves path first" );
				return path;
			}
		},
		"fs": {
			async stat( path ) {
				assert.strictEqual( path, "/foo/bar", "Calls fs.stat" );
				if ( fail ) {
					throw new Error( "fail" );
				}
				return statsObj;
			}
		}
	});

	try {
		await stat( "/foo/bar" );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail", "Rejects on stat failure" );
	}

	fail = false;

	try {
		const resolvedPath = await stat( "/foo/bar" );
		assert.strictEqual( resolvedPath, "/foo/bar", "Resolves with path" );
	} catch ( e ) {
		throw e;
	}

	try {
		const stats = await stat( "/foo/bar", null, true );
		assert.strictEqual( stats, statsObj, "Resolves with stats object" );
	} catch ( e ) {
		throw e;
	}

});


test( "With callback", async assert => {

	assert.expect( 3 );

	let fail = true;

	class Stats {
		validate() {
			return !fail;
		}
	}

	const { stat } = statInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": {},
		"path": {
			resolve( path ) {
				return path;
			}
		},
		"fs": {
			async stat() {
				return new Stats();
			}
		}
	});

	try {
		await stat( "/foo/bar", stats => stats.validate() );
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid", "Rejects if callback fails" );
	}

	fail = false;

	try {
		const resolvedPath = await stat( "/foo/bar", stats => stats.validate() );
		assert.strictEqual( resolvedPath, "/foo/bar", "Resolves if callback succeeds" );
		const stats = await stat( "/foo/bar", stats => stats.validate(), true );
		assert.ok( stats instanceof Stats, "Resolves with stats object" );
	} catch ( e ) {
		throw e;
	}

});


test( "Validation callbacks", assert => {

	const { isDirectory, isFile, isExecutable: isExecWin } = statInjector({
		"utils/node/denodify": () => {},
		"path": {},
		"fs": {},
		"utils/node/platform": {
			isWin: true
		}
	});

	const { isExecutable: isExecPosix } = statInjector({
		"utils/node/denodify": () => {},
		"path": {},
		"fs": {},
		"utils/node/platform": {
			isWin: false
		}
	});

	assert.notOk( isDirectory({ isDirectory() { return false; } }), "Is not a directory" );
	assert.ok( isDirectory({ isDirectory() { return true; } }), "Is a directory" );

	assert.notOk( isFile({ isFile() { return false; } }), "Is not a file" );
	assert.ok( isFile({ isFile() { return true; } }), "Is a file" );

	assert.notOk( isExecWin({ isFile() { return false; }, mode: 0 }), "Isn't an executable" );
	assert.ok( isExecWin({ isFile() { return true; }, mode: 0 }), "Is an executable" );

	assert.notOk( isExecPosix({ isFile() { return false; }, mode: 0 }), "Isn't an executable" );
	assert.notOk( isExecPosix({ isFile() { return false; }, mode: 0o111 }), "Isn't an executable" );
	assert.notOk( isExecPosix({ isFile() { return true; }, mode: 0 }), "Is not executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o111 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o100 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o010 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o001 }), "Is an executable" );

});
