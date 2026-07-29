// TODO: properly rewrite tests by using sinon
import { module, test } from "qunit";

import whichInjector from "inject-loader!utils/node/fs/which";


module( "utils/node/fs/which" );


test( "Relative or absolute path", async assert => {

	assert.expect( 6 );

	const isFile = () => {};

	const { default: which } = whichInjector({
		"utils/node/env-path": {
			paths: []
		},
		"utils/node/fs/stat": {
			async stat( dir, callback ) {
				assert.strictEqual( dir, "foo/bar", "Tries to find foo/bar" );
				assert.strictEqual( callback, isFile, "Uses correct directory validation" );
				return dir;
			}
		},
		"path": {
			sep: "/"
		}
	});

	await assert.rejects(
		which(),
		new Error( "Missing file" ),
		"Rejects on missing file"
	);

	await assert.rejects(
		which( "" ),
		new Error( "Missing file" ),
		"Rejects on empty file"
	);

	await assert.rejects(
		which( "foo", isFile ),
		new Error( "Could not find foo" ),
		"Rejects if file can't be found"
	);

	const resolvedPath = await which( "foo/bar", isFile );
	assert.strictEqual( resolvedPath, "foo/bar", "Finds foo/bar" );

});


test( "Path iteration", async assert => {

	assert.expect( 26 );

	let expected;

	const isFile = () => {};

	const { default: which } = whichInjector({
		"utils/node/env-path": {
			paths: [
				"/path/to/a",
				"/path/to/b"
			]
		},
		"utils/node/fs/stat": {
			async stat( path, callback ) {
				assert.step( "stat" );
				assert.step( path );
				assert.strictEqual( callback, isFile, "Uses correct directory validation" );
				if ( path !== expected ) {
					throw new Error( "fail" );
				}
				return path;
			}
		},
		"path": {
			sep: "/",
			join( ...paths ) {
				assert.step( "join" );
				return paths.join( "/" );
			}
		}
	});

	await assert.rejects(
		which( "foo", isFile ),
		new Error( "Could not find foo" ),
		"Rejects"
	);
	assert.checkSteps(
		[
			"join", "stat", "/path/to/a/foo",
			"join", "stat", "/path/to/b/foo"
		],
		"Calls functions in correct order"
	);

	expected = "/path/to/b/foo";

	await ( async () => {
		const path = await which( "foo", isFile );
		assert.strictEqual( path, expected, "Resolves with correct path" );
		assert.checkSteps(
			[
				"join", "stat", "/path/to/a/foo",
				"join", "stat", "/path/to/b/foo"
			],
			"Calls functions in correct order"
		);
	})();

	expected = "/path/to/a/foo";

	await ( async () => {
		const path = await which( "foo", isFile );
		assert.strictEqual( path, expected, "Resolves with correct path" );
		assert.checkSteps(
			[
				"join", "stat", "/path/to/a/foo"
			],
			"Calls functions in correct order"
		);
	})();

});
