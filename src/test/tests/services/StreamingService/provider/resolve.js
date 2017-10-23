import {
	module,
	test
} from "qunit";
import resolveProviderInjector from "inject-loader!services/StreamingService/provider/resolve";
import { ProviderError } from "services/StreamingService/errors";
import ExecObj from "services/StreamingService/exec-obj";


const { assign } = Object;
const isFile = () => {};
const commonDeps = {
	"utils/node/platform": {
		platform: "linux"
	},
	"../logger": {
		logDebug() {}
	},
	"../errors": {
		ProviderError
	},
	"../exec-obj": ExecObj,
	"utils/node/fs/stat": {
		isFile
	},
	"utils/node/fs/whichFallback": () => {},
	"./find-pythonscript-interpreter": () => {},
	"./validate": () => {}
};


module( "services/StreamingService/provider/resolve" );


test( "Cached provider data", async assert => {

	assert.expect( 3 );

	const cache = {};
	const stream = {};

	const resolveProvider = resolveProviderInjector( assign( {}, commonDeps, {
		"config": {
			streaming: {
				providers: {}
			}
		},
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			providerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return cache;
				},
				set() {
					throw new Error( "Calls providerCache.set" );
				}
			}
		}
	}) )[ "default" ];

	const result = await resolveProvider( stream, "", {} );
	assert.strictEqual( result, cache, "Returns cache if it is available" );

});


test( "Missing provider data", async assert => {

	assert.expect( 18 );

	const commonTestDeps = {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			providerCache: {
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

	const stream = {};

	let resolveProvider = resolveProviderInjector( assign( {}, commonDeps, commonTestDeps, {
		"config": {
			streaming: {
				providers: {
					streamlink: {
						exec: {
							linux: null
						}
					}
				}
			}
		}
	}) )[ "default" ];

	try {
		await resolveProvider( stream, "streamlink", {} );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Invalid streaming provider: streamlink",
			"Throws error on missing provider data"
		);
	}

	try {
		await resolveProvider( stream, "livestreamer", { livestreamer: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Invalid streaming provider: livestreamer",
			"Throws error on missing provider data"
		);
	}

	try {
		await resolveProvider( stream, "streamlink", { streamlink: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Missing executable name for streaming provider",
			"Throws error on missing provider exec conf data or user data"
		);
	}

	resolveProvider = resolveProviderInjector( assign( {}, commonTestDeps, commonDeps, {
		"config": {
			streaming: {
				providers: {
					streamlink: {
						exec: {
							linux: "streamlink"
						}
					}
				}
			}
		},
		"utils/node/platform": {
			platform: "win32"
		}
	}) )[ "default" ];

	try {
		await resolveProvider( stream, "streamlink", { streamlink: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Missing executable name for streaming provider",
			"Throws error on missing exec for current platform"
		);
	}

	resolveProvider = resolveProviderInjector( assign( {}, commonTestDeps, commonDeps, {
		"config": {
			streaming: {
				providers: {
					streamlink: {
						python: true,
						exec: {
							linux: "python"
						},
						pythonscript: {
							linux: null
						}
					}
				}
			}
		},
		"utils/node/platform": {
			platform: "linux"
		}
	}) )[ "default" ];

	try {
		await resolveProvider( stream, "streamlink", { streamlink: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Missing python script for streaming provider",
			"Throws error on missing pythonscript"
		);
	}

	resolveProvider = resolveProviderInjector( assign( {}, commonTestDeps, commonDeps, {
		"config": {
			streaming: {
				providers: {
					streamlink: {
						python: true,
						exec: {
							win32: "python"
						},
						pythonscript: {
							linux: "streamlink"
						}
					}
				}
			}
		},
		"utils/node/platform": {
			platform: "win32"
		}
	}) )[ "default" ];

	try {
		await resolveProvider( stream, "streamlink", { streamlink: {} } );
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Missing python script for streaming provider",
			"Throws error on missing pythonscript for current platform"
		);
	}

});


test( "Resolve exec (no pythonscript)", async assert => {

	assert.expect( 22 );

	const stream = {};

	let expected;

	let whichFallback = () => {
		throw new Error();
	};
	let setupCache = () => {
		throw new Error( "Calls setupCache" );
	};

	const resolveProvider = resolveProviderInjector( assign( {}, commonDeps, {
		"config": {
			streaming: {
				providers: {
					"livestreamer-standalone": {
						exec: {
							win32: "livestreamer.exe"
						},
						fallback: {
							win32: [
								"C:\\livestreamer"
							]
						}
					}
				}
			}
		},
		"utils/node/platform": {
			platform: "win32"
		},
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			providerCache: {
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
		await resolveProvider( stream, "livestreamer-standalone", {
			"livestreamer-standalone": {}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof ProviderError,
			"Throws a ProviderError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find executable",
			"ProviderError has the correct message"
		);
	}

	// fail (custom exec)
	try {
		await resolveProvider( stream, "livestreamer-standalone", {
			"livestreamer-standalone": {
				exec: "C:\\non-existing\\livestreamer.exe"
			}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof ProviderError,
			"Throws a ProviderError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find executable",
			"ProviderError has the correct message"
		);
	}

	setupCache = obj => {
		assert.propEqual( obj, expected, "Sets up cache with correct execObj" );
	};

	// succeed (no custom exec)
	try {
		expected = {
			exec: "C:\\livestreamer\\livestreamer.exe",
			params: null,
			env: null
		};
		whichFallback = ( exec, fallbacks ) => {
			assert.strictEqual( exec, "livestreamer.exe", "Looks up the correct exec" );
			assert.propEqual(
				fallbacks,
				{ win32: [ "C:\\livestreamer" ] },
				"Uses correct fallback paths"
			);
			return "C:\\livestreamer\\livestreamer.exe";
		};
		const result = await resolveProvider( stream, "livestreamer-standalone", {
			"livestreamer-standalone": {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (custom exec)
	try {
		expected = {
			exec: "C:\\custom\\standalone.exe",
			params: null,
			env: null
		};
		whichFallback = ( exec, fallbacks ) => {
			assert.strictEqual( exec, "C:\\custom\\standalone.exe", "Looks up the correct exec" );
			assert.strictEqual( fallbacks, undefined, "Doesn't use fallback paths" );
			return exec;
		};
		const result = await resolveProvider( stream, "livestreamer-standalone", {
			"livestreamer-standalone": {
				exec: "C:\\custom\\standalone.exe"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

});


test( "Resolve exec (pythonscript)", async assert => {

	assert.expect( 75 );

	const stream = {};
	const pythonscriptfallback = [
		"/usr/bin",
		"/usr/local/bin"
	];

	let expected;

	let whichFallback;
	let findPythonscriptInterpreter = () => {
		throw new Error();
	};
	let setupCache = () => {
		throw new Error( "Calls providerCache.set" );
	};

	const commonTestDeps = {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../cache": {
			providerCache: {
				get() {
					assert.ok( true, "Calls providerCache.get" );
					return null;
				},
				set: ( ...args ) => setupCache( ...args )
			}
		},
		"utils/node/fs/whichFallback": ( ...args ) => whichFallback( ...args ),
		"./find-pythonscript-interpreter": ( ...args ) => findPythonscriptInterpreter( ...args )
	};

	const streamlinkConfig = {
		python: true,
		exec: {
			linux: "python"
		},
		fallback: {
			linux: [
				"/usr/bin",
				"/usr/local/bin"
			]
		},
		pythonscript: {
			linux: "streamlink"
		},
		pythonscriptfallback
	};

	let resolveProvider = resolveProviderInjector( assign( {}, commonDeps, commonTestDeps, {
		"config": {
			streaming: {
				providers: {
					streamlink: streamlinkConfig
				}
			}
		}
	}) )[ "default" ];

	// fail (no custom pythonscript)
	try {
		whichFallback = ( pythonscript, fallbacks, check ) => {
			assert.strictEqual( pythonscript, "streamlink", "Looks up default pythonscript" );
			assert.strictEqual( fallbacks, pythonscriptfallback, "Uses correct fallback paths" );
			assert.strictEqual( check, isFile, "Uses correct file check callback" );
			throw new Error();
		};
		await resolveProvider( stream, "streamlink", { "streamlink": {} } );
	} catch ( e ) {
		assert.ok(
			e instanceof ProviderError,
			"Throws a ProviderError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find python script",
			"ProviderError has the correct message"
		);
	}

	// fail (custom pythonscript)
	try {
		whichFallback = ( pythonscript, fallbacks, check ) => {
			assert.strictEqual( pythonscript, "foo", "Looks up custom pythonscript" );
			assert.strictEqual( fallbacks, pythonscriptfallback, "Uses correct fallback paths" );
			assert.strictEqual( check, isFile, "Uses correct file check callback" );
			throw new Error();
		};
		await resolveProvider( stream, "streamlink", {
			"streamlink": {
				pythonscript: "foo"
			}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof ProviderError,
			"Throws a ProviderError on unresolvable file"
		);
		assert.strictEqual(
			e.message,
			"Couldn't find python script",
			"ProviderError has the correct message"
		);
	}

	whichFallback = () => "/usr/bin/streamlink";

	// fail (findPythonscriptInterpreter)
	try {
		findPythonscriptInterpreter = () => {
			throw new Error();
		};
		await resolveProvider( stream, "streamlink", {
			"streamlink": {}
		});
	} catch ( e ) {
		assert.ok(
			e instanceof ProviderError,
			"Throws a ProviderError on unresolvable pythonscript"
		);
		assert.strictEqual(
			e.message,
			"Couldn't validate python script",
			"ProviderError has the correct message"
		);
	}

	setupCache = obj => {
		assert.propEqual( obj, expected, "Sets up cache with correct execObj" );
	};

	// succeed (simple pythonscript)
	try {
		expected = {
			exec: "/usr/bin/python",
			params: [ "/usr/bin/streamlink" ],
			env: null
		};
		findPythonscriptInterpreter = ( pythonscript, providerConf ) => {
			assert.strictEqual( pythonscript, "/usr/bin/streamlink", "Uses correct pythonscript" );
			assert.strictEqual( providerConf, streamlinkConfig, "Uses correct provider conf" );
			return new ExecObj( "/usr/bin/python" );
		};
		const result = await resolveProvider( stream, "streamlink", {
			"streamlink": {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (bash wrapper script)
	try {
		expected = {
			exec: "/usr/bin/python",
			params: [ "/usr/bin/different-streamlink" ],
			env: { foo: "bar" }
		};
		whichFallback = () => "/usr/bin/custom";
		findPythonscriptInterpreter = ( pythonscript, providerConf ) => {
			assert.strictEqual( pythonscript, "/usr/bin/custom", "Uses correct pythonscript" );
			assert.strictEqual( providerConf, streamlinkConfig, "Uses correct provider conf" );
			return new ExecObj(
				"/usr/bin/python",
				[ "/usr/bin/different-streamlink" ],
				{ foo: "bar" }
			);
		};
		const result = await resolveProvider( stream, "streamlink", {
			"streamlink": {
				pythonscript: "custom"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// fail (custom exec and simple pythonscript or bash wrapper script)
	try {
		let whichFallbackCalls = 0;
		whichFallback = ( file, fallbacks, check ) => {
			if ( ++whichFallbackCalls === 1 ) {
				assert.strictEqual( file, "streamlink", "Looks up pythonscript first" );
				assert.strictEqual( fallbacks, pythonscriptfallback, "Uses pythonscriptfallbacks" );
				assert.strictEqual( check, isFile, "Uses correct file check callback" );
				return "/usr/bin/streamlink";
			} else if ( whichFallbackCalls === 2 ) {
				assert.strictEqual( file, "custom-exec", "Looks up custom exec afterwards" );
				assert.strictEqual( fallbacks, undefined, "Doesn't use fallbacks" );
				assert.strictEqual( check, undefined, "Uses default file check callback" );
				throw new Error();
			} else {
				throw new Error( "Calls whichFallback more than twice" );
			}
		};
		findPythonscriptInterpreter = () => ({
			exec: "/usr/bin/python"
		});
		await resolveProvider( stream, "streamlink", {
			"streamlink": {
				exec: "custom-exec"
			}
		});
	} catch ( e ) {
		assert.ok( e instanceof ProviderError, "Throws a ProviderError" );
		assert.strictEqual(
			e.message,
			"Couldn't find python executable",
			"ProviderError has the correct message"
		);
	}

	// succeed (custom exec and simple pythonscript)
	try {
		expected = {
			exec: "/usr/bin/custom-exec",
			params: [ "/usr/bin/streamlink" ],
			env: null
		};
		let whichFallbackCalls = 0;
		whichFallback = ( file, fallbacks, check ) => {
			if ( ++whichFallbackCalls === 1 ) {
				assert.strictEqual( file, "streamlink", "Looks up pythonscript first" );
				assert.strictEqual( fallbacks, pythonscriptfallback, "Uses pythonscriptfallbacks" );
				assert.strictEqual( check, isFile, "Uses correct file check callback" );
				return "/usr/bin/streamlink";
			} else if ( whichFallbackCalls === 2 ) {
				assert.strictEqual( file, "custom-exec", "Looks up custom exec afterwards" );
				assert.strictEqual( fallbacks, undefined, "Doesn't use fallbacks" );
				assert.strictEqual( check, undefined, "Uses default file check callback" );
				return "/usr/bin/custom-exec";
			} else {
				throw new Error( "Calls whichFallback more than twice" );
			}
		};
		findPythonscriptInterpreter = () => ({
			exec: "/usr/bin/python"
		});
		const result = await resolveProvider( stream, "streamlink", {
			"streamlink": {
				exec: "custom-exec"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (custom exec and custom malformed pythonscript)
	try {
		expected = {
			exec: "/usr/bin/custom-exec",
			params: [ "/usr/bin/custom-streamlink" ],
			env: null
		};
		let whichFallbackCalls = 0;
		whichFallback = ( file, fallbacks, check ) => {
			if ( ++whichFallbackCalls === 1 ) {
				assert.strictEqual( file, "/usr/bin/custom-streamlink", "Looks up pythonscript" );
				assert.strictEqual( fallbacks, pythonscriptfallback, "Uses pythonscriptfallbacks" );
				assert.strictEqual( check, isFile, "Uses correct file check callback" );
				return file;
			} else if ( whichFallbackCalls === 2 ) {
				assert.strictEqual( file, "/usr/bin/custom-exec", "Looks up custom exec" );
				assert.strictEqual( fallbacks, undefined, "Doesn't use fallbacks" );
				assert.strictEqual( check, undefined, "Uses default file check callback" );
				return file;
			} else {
				throw new Error( "Calls whichFallback more than twice" );
			}
		};
		findPythonscriptInterpreter = () => new ExecObj();
		const result = await resolveProvider( stream, "streamlink", {
			"streamlink": {
				exec: "/usr/bin/custom-exec",
				pythonscript: "/usr/bin/custom-streamlink"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

	// succeed (custom exec and bash wrapper script)
	try {
		expected = {
			exec: "/usr/bin/custom-exec",
			params: [ "/usr/bin/different-streamlink" ],
			env: { foo: "bar" }
		};
		let whichFallbackCalls = 0;
		whichFallback = ( file, fallbacks, check ) => {
			if ( ++whichFallbackCalls === 1 ) {
				assert.strictEqual( file, "streamlink", "Looks up pythonscript first" );
				assert.strictEqual( fallbacks, pythonscriptfallback, "Uses pythonscriptfallbacks" );
				assert.strictEqual( check, isFile, "Uses correct file check callback" );
				return "/usr/bin/streamlink";
			} else if ( whichFallbackCalls === 2 ) {
				assert.strictEqual( file, "custom-exec", "Looks up custom exec afterwards" );
				assert.strictEqual( fallbacks, undefined, "Doesn't use fallbacks" );
				assert.strictEqual( check, undefined, "Uses default file check callback" );
				return "/usr/bin/custom-exec";
			} else {
				throw new Error( "Calls whichFallback more than twice" );
			}
		};
		findPythonscriptInterpreter = () => new ExecObj(
			"/usr/bin/python",
			[ "/usr/bin/different-streamlink" ],
			{ foo: "bar" }
		);
		const result = await resolveProvider( stream, "streamlink", {
			"streamlink": {
				exec: "custom-exec"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
	} catch ( e ) {
		throw e;
	}

});
