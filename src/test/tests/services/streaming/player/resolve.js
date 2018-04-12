import { module, test } from "qunit";

import resolvePlayerInjector from "inject-loader!services/streaming/player/resolve";
import { PlayerError } from "services/streaming/errors";
import ExecObj from "services/streaming/exec-obj";


const { assign } = Object;
const commonDeps = {
	"utils/node/platform": {
		platform: "linux"
	},
	"../logger": {
		logDebug() {}
	},
	"../errors": {
		PlayerError
	},
	"../exec-obj": ExecObj,
	"utils/node/fs/whichFallback": () => {}
};


module( "services/streaming/player/resolve" );


test( "Cached player data", async assert => {

	assert.expect( 3 );

	const cache = {};
	const stream = {};

	const resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, {
		"config": {
			players: {}
		},
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			playerCache: {
				get() {
					assert.ok( true, "Calls playerCache.get" );
					return cache;
				},
				set() {
					throw new Error( "Calls playerCache.set" );
				}
			}
		}
	}) )[ "default" ];

	const result = await resolvePlayer( stream, "", {} );
	assert.strictEqual( result, cache, "Returns cache if it is available" );

});


test( "Default player profile", async assert => {

	assert.expect( 16 );

	const stream = {};
	let expected;

	const commonTestDeps = {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			playerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return null;
				},
				set( obj ) {
					assert.propEqual( obj, expected, "Sets up cache with correct execObj" );
				}
			}
		}
	};

	const resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, commonTestDeps, {
		"config": {
			players: {}
		}
	}) )[ "default" ];

	// no user config
	try {
		expected = {
			exec: null,
			env: null,
			params: null
		};
		const result = await resolvePlayer( stream, "default", {
			"default": {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// custom exec
	try {
		expected = {
			exec: "foo",
			env: null,
			params: null
		};
		const result = await resolvePlayer( stream, "default", {
			"default": {
				exec: "foo"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// custom params
	try {
		expected = {
			exec: "foo",
			env: null,
			params: "bar {filename}"
		};
		const result = await resolvePlayer( stream, "default", {
			"default": {
				exec: "foo",
				args: "bar"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// custom params, but no custom exec
	try {
		expected = {
			exec: null,
			env: null,
			params: null
		};
		const result = await resolvePlayer( stream, "default", {
			"default": {
				exec: null,
				args: "bar"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

});


test( "Missing player data", async assert => {

	assert.expect( 9 );

	const stream = {};

	const commonTestDeps = {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			playerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return null;
				},
				set() {
					throw new Error( "Calls providerCache.set" );
				}
			}
		}
	};

	let resolvePlayer;

	resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, commonTestDeps, {
		"config": {
			players: {}
		}
	}) )[ "default" ];

	try {
		await resolvePlayer( stream, "mpv", { mpv: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Invalid player profile: mpv",
			"Throws error on missing player data"
		);
	}

	resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, commonTestDeps, {
		"config": {
			players: {
				mpv: {
					exec: {
						linux: null
					}
				}
			}
		}
	}) )[ "default" ];

	try {
		await resolvePlayer( stream, "mpv", {} );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Invalid player profile: mpv",
			"Throws error on missing player data"
		);
	}

	try {
		await resolvePlayer( stream, "mpv", { mpv: { exec: null } } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Missing player executable name",
			"Throws error on missing player exec conf data or user data"
		);
	}

});


test( "Resolve exec", async assert => {

	assert.expect( 20 );

	const stream = {};

	let expected;

	let whichFallback = () => {
		throw new Error();
	};
	let setupCache = () => {
		throw new Error( "Calls setupCache" );
	};

	const resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, {
		"config": {
			players: {
				mpv: {
					exec: {
						linux: "mpv"
					},
					fallback: {
						linux: [
							"/usr/bin"
						]
					},
					params: []
				}
			}
		},
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			playerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return null;
				},
				set: ( ...args ) => setupCache( ...args )
			}
		},
		"utils/node/fs/whichFallback": ( ...args ) => whichFallback( ...args )
	}) )[ "default" ];


	// fail (no custom exec)
	try {
		await resolvePlayer( stream, "mpv", {
			"mpv": {}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof PlayerError,
			"Throws a NotFoundError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find player executable",
			"PlayerError has the correct message"
		);
	}

	// fail (custom exec)
	try {
		await resolvePlayer( stream, "mpv", {
			"mpv": {
				exec: "/usr/bin/mpv"
			}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof PlayerError,
			"Throws a PlayerError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find player executable",
			"PlayerError has the correct message"
		);
	}

	setupCache = obj => {
		assert.propEqual( obj, expected, "Sets up cache with correct execObj" );
	};

	// succeed (no custom exec)
	try {
		expected = {
			exec: "/usr/bin/mpv",
			params: "{filename}",
			env: null
		};
		whichFallback = ( exec, fallbacks ) => {
			assert.strictEqual( exec, "mpv", "Looks up the correct exec" );
			assert.propEqual(
				fallbacks,
				{ linux: [ "/usr/bin" ] },
				"Uses correct fallback paths"
			);
			return "/usr/bin/mpv";
		};
		const result = await resolvePlayer( stream, "mpv", {
			"mpv": {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (custom exec)
	try {
		expected = {
			exec: "/usr/bin/mpv",
			params: "{filename}",
			env: null
		};
		whichFallback = ( exec, fallbacks ) => {
			assert.strictEqual( exec, "/usr/bin/mpv", "Looks up the correct exec" );
			assert.propEqual(
				fallbacks,
				{ linux: [ "/usr/bin" ] },
				"Uses correct fallback paths"
			);
			return exec;
		};
		const result = await resolvePlayer( stream, "mpv", {
			"mpv": {
				exec: "/usr/bin/mpv"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

});


test( "Resolve parameters", async assert => {

	assert.expect( 32 );

	const stream = {};
	const config = {
		exec: {
			linux: "mpv"
		},
		fallback: {
			linux: [
				"/usr/bin"
			]
		},
		params: null
	};

	let expected;

	let setupCache = () => {
		throw new Error( "Calls setupCache" );
	};

	const resolvePlayer = resolvePlayerInjector( assign( {}, commonDeps, {
		"config": {
			players: {
				mpv: config
			}
		},
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			playerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return null;
				},
				set: ( ...args ) => setupCache( ...args )
			}
		},
		"utils/node/fs/whichFallback": () => null
	}) )[ "default" ];


	// fail (no player params)
	try {
		await resolvePlayer( stream, "mpv", {
			mpv: {}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof PlayerError,
			"Throws a PlayerError on missing player params"
		);
		assert.strictEqual(
			e.message,
			"Error while generating player parameters",
			"Error has the correct message"
		);
	}

	config.params = [
		{
			type: "foo"
		}
	];

	// fail (invalid parameter type)
	try {
		await resolvePlayer( stream, "mpv", {
			mpv: {}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof PlayerError,
			"Throws a PlayerError on invalid or unsupported player parameter"
		);
		assert.strictEqual(
			e.message,
			"Error while generating player parameters",
			"Error has the correct message"
		);
	}

	setupCache = obj => {
		assert.propEqual( obj, expected, "Sets up cache with correct execObj" );
	};

	config.params = [];

	// succeed (no params)
	try {
		expected = {
			exec: null,
			env: null,
			params: "{filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	config.params = [
		{
			type: "boolean",
			name: "foo",
			args: "--foo"
		}
	];

	// succeed (disabled boolean parameter)
	try {
		expected = {
			exec: null,
			env: null,
			params: "{filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {
				params: {
					foo: false
				}
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (enabled boolean parameter)
	try {
		expected = {
			exec: null,
			env: null,
			params: "--foo {filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (custom user parameters)
	try {
		expected = {
			exec: null,
			env: null,
			params: "--bar --baz --foo {filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {
				args: "--bar --baz",
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	config.params = [
		{
			type: "boolean",
			name: "foo",
			args: {
				linux: null
			}
		}
	];

	// succeed (missing platform specific parameters)
	try {
		expected = {
			exec: null,
			env: null,
			params: "{filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	config.params = [
		{
			type: "boolean",
			name: "foo",
			args: {
				linux: "--foo"
			}
		}
	];

	// succeed (missing platform specific parameters)
	try {
		expected = {
			exec: null,
			env: null,
			params: "--foo {filename}"
		};
		const result = await resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

});
