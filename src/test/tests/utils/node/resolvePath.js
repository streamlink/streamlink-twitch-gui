import {
	module,
	test
} from "qunit";
import * as path from "stub-path";
import resolvePathInjector from "inject-loader!utils/node/resolvePath";


const modulePlatform = "utils/node/platform";

const resolvePathPosix = resolvePathInjector({
	[ modulePlatform ]: { isWin: false },
	path
})[ "default" ];
const resolvePathWin = resolvePathInjector({
	[ modulePlatform ]: { isWin: true },
	path
})[ "default" ];


let ENV;


module( "utils/node/resolvePath", {
	beforeEach() {
		ENV = process.env;
	},
	afterEach() {
		process.env = ENV;
	}
});


test( "Resolve path POSIX", assert => {

	assert.deepEqual( resolvePathPosix( "/foo", "bar/baz" ), "/foo/bar/baz", "No env vars" );

	process.env = { FOO: "/foo" };
	assert.equal( resolvePathPosix( "$FOO", "bar/baz" ), "/foo/bar/baz", "Existing env var" );
	assert.equal( resolvePathPosix( "$QUX", "bar/baz" ), "/bar/baz", "Non existing env var" );

});


test( "Resolve path Windows", assert => {

	assert.equal( resolvePathWin( "/foo", "bar/baz" ), "/foo/bar/baz", "No env vars" );

	process.env = { FOO: "/foo" };
	assert.equal( resolvePathWin( "%FOO%", "bar/baz" ), "/foo/bar/baz", "Existing env var" );
	assert.equal( resolvePathWin( "%QUX%", "bar/baz" ), "/bar/baz", "Non existing env var" );

});
