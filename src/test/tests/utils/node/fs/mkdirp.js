import {
	module,
	test
} from "qunit";
import mkdirpInjector from "inject-loader!utils/node/fs/mkdirp";
import { posix as path } from "path";
import {
	R_OK,
	W_OK
} from "fs";


module( "utils/node/fs/mkdirp" );


test( "No directory", async assert => {

	assert.expect( 3 );

	const { default: mkdirp } = mkdirpInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			async stat( dir ) {
				assert.strictEqual( dir, "/foo/bar", "Tries to validate directory" );
				throw new Error( "fail stat" );
			}
		},
		path,
		fs: {
			W_OK,
			async mkdir( dir ) {
				assert.strictEqual( dir, "/foo/bar", "Tries to create directory" );
				throw new Error( "fail mkdir" );
			}
		}
	});

	try {
		await mkdirp( "/foo/bar" );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail stat", "Rejects with an error" );
	}

});


test( "Already existing directory", async assert => {

	assert.expect( 1 );

	const { default: mkdirp } = mkdirpInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			async stat() {
				throw new Error( "Should not get called" );
			}
		},
		path,
		fs: {
			W_OK,
			async mkdir() {
				const err = new Error();
				err.code = "EEXIST";
				throw err;
			}
		}
	});

	const dir = await mkdirp( "/foo/bar" );
	assert.strictEqual( dir, "/foo/bar", "Resolves with correct path" );

});


test( "New directory", async assert => {

	assert.expect( 3 );

	const paths = [];
	const existing = [ "/foo" ];

	const { default: mkdirp } = mkdirpInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			async stat() {
				throw new Error( "Should not get called" );
			}
		},
		path,
		fs: {
			W_OK,
			async mkdir( dir ) {
				paths.push( dir );

				// parent does not exist
				if ( !existing.includes( path.dirname( dir ) ) ) {
					const err = new Error();
					err.code = "ENOENT";
					throw err;
				}

				// create new folder
				existing.push( dir );

				return dir;
			}
		}
	});

	const dir = await mkdirp( "/foo/bar/baz/qux" );
	assert.strictEqual( dir, "/foo/bar/baz/qux", "Returns path" );
	assert.propEqual(
		paths,
		[
			"/foo/bar/baz/qux",
			"/foo/bar/baz",
			"/foo/bar",
			"/foo/bar/baz",
			"/foo/bar/baz/qux"
		],
		"Creates all necessary parent directories"
	);
	assert.propEqual(
		existing,
		[
			"/foo",
			"/foo/bar",
			"/foo/bar/baz",
			"/foo/bar/baz/qux"
		],
		"Checks all required parent directories"
	);

});


test( "Non-writable parent directory", async assert => {

	assert.expect( 3 );

	const dirs = [];

	const { default: mkdirp } = mkdirpInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			async stat( dir ) {
				assert.strictEqual( dir, "/foo", "Checks whether parent dir is writable" );

				throw new Error( "stat fail" );
			}
		},
		path,
		fs: {
			W_OK,
			async mkdir( dir ) {
				dirs.push( dir );

				const err = new Error();
				// parent dir /foo exists, but is not writable
				err.code = dir === "/foo"
					? "EACCES"
					: "ENOENT";
				throw err;
			}
		}
	});

	try {
		await mkdirp( "/foo/bar" );
	} catch ( e ) {
		assert.strictEqual( e.message, "stat fail", "Rejects if parent dir not writable" );
		assert.propEqual(
			dirs,
			[
				"/foo/bar",
				"/foo"
			],
			"Tries to create all parent directories"
		);
	}

});


test( "Directory check function", async assert => {

	const { check: checkPosix } = mkdirpInjector({
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory( stats ) {
				return stats.isDirectory();
			},
			stat() {}
		},
		path,
		fs: {
			W_OK
		}
	});

	const { check: checkWin } = mkdirpInjector({
		"utils/node/platform": { isWin: true },
		"utils/node/fs/stat": {
			isDirectory( stats ) {
				return stats.isDirectory();
			},
			stat() {}
		},
		path,
		fs: {
			W_OK
		}
	});

	assert.ok(
		checkPosix({
			mode: R_OK | W_OK,
			isDirectory() { return true; }
		}),
		"Writable dir on POSIX"
	);

	assert.ok(
		!checkPosix({
			mode: R_OK,
			isDirectory() { return true; }
		}),
		"Non-writable dir on POSIX"
	);

	assert.ok(
		!checkPosix({
			mode: W_OK,
			isDirectory() { return false; }
		}),
		"Non-dir on POSIX"
	);

	assert.ok(
		checkWin({
			mode: R_OK,
			isDirectory() { return true; }
		}),
		"Dir on Windows"
	);

	assert.ok(
		!checkWin({
			mode: R_OK,
			isDirectory() { return false; }
		}),
		"Non-dir on Windows"
	);

});
