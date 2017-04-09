import {
	module,
	test
} from "qunit";
import mkdirpInjector from "inject-loader?-utils/node/denodify!utils/node/fs/mkdirp";
import { posix as path } from "path";
import {
	R_OK,
	W_OK
} from "fs";


module( "utils/node/fs/mkdirp" );


test( "No directory", assert => {

	assert.expect( 1 );

	const mkdirp = mkdirpInjector({
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			stat() {
				return Promise.reject( new Error() );
			}
		},
		path,
		fs: {
			W_OK,
			mkdir( _, callback ) {
				callback( new Error() );
			}
		}
	})[ "default" ];

	return mkdirp( ":" )
		.catch( err => {
			assert.ok( err instanceof Error, "Rejects the promise with an error" );
		});

});


test( "Already existing directory", assert => {

	assert.expect( 1 );

	const mkdirp = mkdirpInjector({
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			stat() {
				assert.ok( false, "Does not call stat" );
			}
		},
		path,
		fs: {
			W_OK,
			mkdir( _, callback ) {
				let err = new Error();
				err.code = "EEXIST";
				callback( err );
			}
		}
	})[ "default" ];

	return mkdirp( "/foo/bar" )
		.then( dir => {
			assert.strictEqual( dir, "/foo/bar", "Returns path" );
		});

});


test( "New directory", assert => {

	assert.expect( 3 );

	let paths = [];
	let existing = [ "/foo" ];

	const mkdirp = mkdirpInjector({
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			stat() {
				assert.ok( false, "Does not call stat" );
			}
		},
		path,
		fs: {
			W_OK,
			mkdir( dir, callback ) {
				paths.push( dir );

				// parent does not exist
				if ( existing.indexOf( path.dirname( dir ) ) === -1 ) {
					let err = new Error();
					err.code = "ENOENT";
					callback( err );

				// create new folder
				} else {
					existing.push( dir );
					callback( null, dir );
				}
			}
		}
	})[ "default" ];

	return mkdirp( "/foo/bar/baz/qux" )
		.then( dir => {
			assert.strictEqual( dir, "/foo/bar/baz/qux", "Returns path" );
			assert.deepEqual(
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
			assert.deepEqual(
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

});


test( "Non-writable parent directory", assert => {

	assert.expect( 3 );

	let dirs = [];

	const mkdirp = mkdirpInjector({
		"utils/node/platform": { isWin: false },
		"utils/node/fs/stat": {
			isDirectory() {},
			stat( dir ) {
				assert.strictEqual( dir, "/foo", "Checks whether parent dir is writable" );

				return Promise.reject( new Error() );
			}
		},
		path,
		fs: {
			W_OK,
			mkdir( dir, callback ) {
				dirs.push( dir );

				let err = new Error();
				// parent dir /foo exists, but is not writable
				err.code = dir === "/foo"
					? "EACCES"
					: "ENOENT";
				callback( err );
			}
		}
	})[ "default" ];

	return mkdirp( "/foo/bar" )
		.catch( err => {
			assert.ok( err instanceof Error, "Promise rejects" );
			assert.deepEqual(
				dirs,
				[
					"/foo/bar",
					"/foo"
				],
				"Tries to create all parent directories"
			);
		});
});


test( "Directory check function", assert => {

	const checkPosix = mkdirpInjector({
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
	})[ "check" ];

	const checkWin = mkdirpInjector({
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
	})[ "check" ];

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
