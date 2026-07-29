import { module, test } from "qunit";

import resolvePathInjector from "inject-loader!utils/node/resolvePath";


module( "utils/node/resolvePath", {
	beforeEach() {
		this._env = process.env;
	},

	afterEach() {
		process.env = this._env;
	}
});


test( "Resolve path POSIX", function( assert ) {

	const { default: r } = resolvePathInjector({
		"utils/node/platform": {
			isWin: false
		},
		path: {
			resolve( ...args ) {
				return args.join( "/" );
			}
		}
	});

	assert.strictEqual( r(), "", "No arguments" );
	assert.strictEqual( r( undefined ), "", "Empty arguments" );
	assert.strictEqual( r( null ), "", "Empty arguments" );
	assert.strictEqual( r( "/foo", "bar/baz" ), "/foo/bar/baz", "No env vars" );

	process.env = { FOO: "/foo" };
	assert.strictEqual( r( "$FOO", "bar/baz" ), "/foo/bar/baz", "Existing env var" );
	assert.strictEqual( r( "$QUX", "bar/baz" ), "/bar/baz", "Non existing env var" );

});


test( "Resolve path Windows", function( assert ) {

	const { default: r } = resolvePathInjector({
		"utils/node/platform": {
			isWin: true
		},
		path: {
			resolve( ...args ) {
				return args.join( "\\" );
			}
		}
	});

	assert.strictEqual( r(), "", "No arguments" );
	assert.strictEqual( r( undefined ), "", "Empty arguments" );
	assert.strictEqual( r( null ), "", "Empty arguments" );
	assert.strictEqual( r( "C:\\foo", "bar\\baz" ), "C:\\foo\\bar\\baz", "No env vars" );

	process.env = { FOO: "D:\\foo" };
	assert.strictEqual( r( "%FOO%", "bar\\baz" ), "D:\\foo\\bar\\baz", "Existing env var" );
	assert.strictEqual( r( "%QUX%", "bar\\baz" ), "\\bar\\baz", "Non existing env var" );

});
