import {
	module,
	test
} from "QUnit";
import clearfolderInjector from "inject?-utils/node/denodify!utils/node/fs/clearfolder";
import { posix as path } from "path";


module( "utils/node/fs/clearfolder" );


test( "Invalid directory", assert => {

	assert.expect( 1 );

	const clearfolder = clearfolderInjector({
		"utils/node/fs/stat": {
			isFile() {},
			stat() {
				assert.ok( false, "Never calls stat" );
			}
		},
		path,
		fs: {
			readdir( _, callback ) {
				callback( new Error( "Not a directory" ) );
			},
			unlink() {}
		}
	})[ "default" ];

	return clearfolder( "/" )
		.catch( err => {
			assert.ok( err instanceof Error, "Rejects the promise" );
		});

});


test( "All files", assert => {

	assert.expect( 1 );

	let deleted = [];

	const clearfolder = clearfolderInjector({
		"utils/node/fs/stat": {
			isFile( stats ) {
				return stats.isFile();
			},
			stat( file, check ) {
				return Promise.resolve({
					isFile() {
						// bar is not a file
						return file !== "/dir/bar";
					}
				})
					.then( stats => check( stats )
						? file
						: Promise.reject()
					);
			}
		},
		path,
		fs: {
			readdir( _, callback ) {
				callback( null, [
					"foo",
					"bar",
					"baz"
				]);
			},
			unlink( file, callback ) {
				// deleting baz failes
				if ( file === "/dir/baz" ) {
					callback( new Error() );

				} else {
					deleted.push( file );
					callback( null, file );
				}
			}
		}
	})[ "default" ];

	return clearfolder( "/dir" )
		.then( () => {
			assert.deepEqual(
				deleted,
				[
					"/dir/foo"
				],
				"Deletes the correct files and ignores failed attempts"
			);
		});

});


test( "File age threshold", assert => {

	assert.expect( 1 );

	const threshold = 100;

	const now = Date.now;
	Date.now = () => 1000;

	let deleted = [];

	const clearfolder = clearfolderInjector({
		"utils/node/fs/stat": {
			isFile( stats ) {
				return stats.isFile();
			},
			stat( file, check ) {
				return Promise.resolve({
					mtime: file === "/dir/foo"
						// foo is newer than X (don't delete)
						? Date.now() - ( threshold / 2 )
						// bar and baz are older than X (delete)
						: Date.now() - ( threshold * 2 ),
					isFile() {
						// bar is not a file
						return file !== "/dir/bar";
					}
				})
					.then( stats => check( stats )
						? file
						: Promise.reject()
					);
			}
		},
		path,
		fs: {
			readdir( _, callback ) {
				callback( null, [
					"foo",
					"bar",
					"baz"
				]);
			},
			unlink( file, callback ) {
				if ( file === "/dir/bar" ) {
					callback( new Error() );

				} else {
					deleted.push( file );
					callback( null, file );
				}
			}
		}
	})[ "default" ];

	return clearfolder( "/dir", threshold )
		.finally( () => {
			Date.now = now;
		})
		.then( () => {
			assert.deepEqual(
				deleted,
				[
					"/dir/baz"
				],
				"Deletes files not newer than X and ignores failed attempts"
			);
		});

});
