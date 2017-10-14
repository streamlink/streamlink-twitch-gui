import {
	module,
	test
} from "qunit";
import clearfolderInjector from "inject-loader!utils/node/fs/clearfolder";
import { posix as path } from "path";


let originalDateNow;


module( "utils/node/fs/clearfolder", {
	beforeEach() {
		originalDateNow = Date.now;
	},
	afterEach() {
		Date.now = originalDateNow;
	}
});


test( "Invalid directory", async assert => {

	assert.expect( 2 );

	const { default: clearfolder } = clearfolderInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/fs/stat": {
			isFile() {},
			async stat() {
				throw new Error( "Should not get called" );
			}
		},
		path,
		fs: {
			async readdir( dir ) {
				assert.strictEqual( dir, "/foo", "Tries to read the correct directory" );
				throw new Error( "fail readdir" );
			},
			unlink() {}
		}
	});

	try {
		await clearfolder( "/foo" );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail readdir", "Rejects on invalid directory" );
	}

});


test( "All files", async assert => {

	assert.expect( 4 );

	const deleted = [];

	const { default: clearfolder } = clearfolderInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/fs/stat": {
			isFile( stats ) {
				return stats.isFile();
			},
			async stat( file, check ) {
				const stats = {
					isFile() {
						// bar is not a file
						return file !== "/dir/bar";
					}
				};
				if ( check( stats ) ) {
					return file;
				} else {
					throw new Error();
				}
			}
		},
		path,
		fs: {
			async readdir() {
				return [
					"foo",
					"bar",
					"baz"
				];
			},
			async unlink( file ) {
				assert.step( file );

				// deleting baz fails
				if ( file === "/dir/baz" ) {
					throw new Error();

				} else {
					deleted.push( file );
					return file;
				}
			}
		}
	});

	await clearfolder( "/dir" );
	assert.checkSteps(
		[
			"/dir/foo",
			"/dir/baz"
		],
		"Tries to delete all files"
	);
	assert.propEqual(
		deleted,
		[
			"/dir/foo"
		],
		"Deletes the correct files and ignores failed attempts"
	);

});


test( "File age threshold", async assert => {

	assert.expect( 2 );

	const threshold = 100;

	Date.now = () => 1000;

	const { default: clearfolder } = clearfolderInjector({
		"utils/node/denodify": fn => fn,
		"utils/node/fs/stat": {
			isFile( stats ) {
				return stats.isFile();
			},
			async stat( file, check ) {
				const stats = {
					mtime: file === "/dir/foo"
						// foo is newer than X (don't delete)
						? Date.now() - ( threshold / 2 )
						// bar and baz are older than X (delete)
						: Date.now() - ( threshold * 2 ),
					isFile() {
						// bar is not a file
						return file !== "/dir/bar";
					}
				};
				if ( check( stats ) ) {
					return file;
				} else {
					throw new Error();
				}
			}
		},
		path,
		fs: {
			async readdir() {
				return [
					"foo",
					"bar",
					"baz"
				];
			},
			async unlink( file ) {
				if ( file === "/dir/bar" ) {
					throw new Error();
				}

				assert.step( file );

				return file;
			}
		}
	});

	await clearfolder( "/dir", threshold );
	assert.checkSteps(
		[
			"/dir/baz"
		],
		"Deletes files not newer than X and ignores failed attempts"
	);

});
