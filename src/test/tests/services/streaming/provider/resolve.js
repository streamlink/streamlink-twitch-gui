import { module, test } from "qunit";
import sinon from "sinon";

import resolveProviderInjector from "inject-loader!services/streaming/provider/resolve";
import { ProviderError } from "services/streaming/errors";
import ExecObj from "services/streaming/exec-obj";


const stream = {};
const isFile = () => {};


module( "services/streaming/provider/resolve", {
	beforeEach() {
		// predefined config for most of the tests
		this.provider = "streamlink-provider";
		this.platform = "linux";
		this.config = {
			[ this.provider ]: {
				python: true,
				exec: {
					[ this.platform ]: "python"
				},
				fallback: {
					[ this.platform ]: [ "/usr/bin" ]
				},
				pythonscript: {
					[ this.platform ]: "streamlink-script"
				},
				pythonscriptfallback: [ "/usr/bin" ]
			}
		};

		// spys and stubs
		this.isAbortedSpy = sinon.spy();
		this.getProviderCacheStub = sinon.stub().returns( null );
		this.setProviderCacheStub = sinon.stub();
		this.logDebugSpy = sinon.spy();
		this.whichFallbackStub = sinon.stub();
		this.findPythonscriptInterpreterStub = sinon.stub();
		this.validateProviderStub = sinon.stub().returnsArg( 0 );

		// subject
		this.subject = () => resolveProviderInjector({
			"config": {
				streaming: {
					providers: this.config
				}
			},
			"../is-aborted": this.isAbortedSpy,
			"../cache": {
				providerCache: {
					get: this.getProviderCacheStub,
					set: this.setProviderCacheStub
				}
			},
			"../errors": {
				ProviderError
			},
			"../exec-obj": ExecObj,
			"../logger": {
				logDebug: this.logDebugSpy
			},
			"./find-pythonscript-interpreter": this.findPythonscriptInterpreterStub,
			"./validate": this.validateProviderStub,
			"utils/node/platform": {
				platform: this.platform
			},
			"utils/node/fs/whichFallback": this.whichFallbackStub,
			"utils/node/fs/stat": {
				isFile
			}
		})[ "default" ];
	}
});


/**
 * Return already cached provider data
 */
test( "Cached provider data", async function( assert ) {

	const cache = {};
	this.getProviderCacheStub.returns( cache );

	const resolveProvider = this.subject();

	assert.strictEqual(
		await resolveProvider( stream, "", {} ),
		cache,
		"Returns cache if it is available"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.whichFallbackStub.called, "Doesn't look up provider files" );
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );

});


/**
 * Check for existing provider configs
 */
test( "Invalid streaming provider", async function( assert ) {

	this.config = { [ this.provider ]: {} };

	const resolveProvider = this.subject();

	await assert.rejects(
		resolveProvider( stream, this.provider, {} ),
		new Error( "Invalid streaming provider: streamlink-provider" ),
		"Throws error on missing provider user data"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();

	await assert.rejects(
		resolveProvider( stream, "livestreamer", { livestreamer: {} } ),
		new Error( "Invalid streaming provider: livestreamer" ),
		"Throws error on invalid provider data"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );

});


/**
 * Check for existing provider exec configs for current platform
 */
test( "Missing executable name for streaming provider", async function( assert ) {

	let resolveProvider;
	const providerUserData = {};

	this.config = {
		[ this.provider ]: {
			exec: {
				[ this.platform ]: null
			}
		}
	};

	resolveProvider = this.subject();

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new Error( "Missing executable name for streaming provider" ),
		"Throws error on missing provider (user) conf exec data"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();


	this.config = {
		[ this.provider ]: {
			exec: {
				linux: "streamlink-exec"
			}
		}
	};
	this.platform = "win32";

	resolveProvider = this.subject();

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new Error( "Missing executable name for streaming provider" ),
		"Throws error on missing exec for current platform"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

});


/**
 * Check for existing provider python script configs for current platform
 */
test( "Missing python script for streaming provider", async function( assert ) {

	let resolveProvider;
	const providerUserData = {};

	this.config = {
		[ this.provider ]: {
			python: true,
			exec: {
				[ this.platform ]: "python"
			},
			pythonscript: {
				[ this.platform ]: null
			}
		}
	};

	resolveProvider = this.subject();

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new Error( "Missing python script for streaming provider" ),
		"Throws error on missing pythonscript"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();


	this.config = {
		[ this.provider ]: {
			python: true,
			exec: {
				win32: "python"
			},
			pythonscript: {
				linux: "streamlink-script"
			}
		}
	};
	this.platform = "win32";

	resolveProvider = this.subject();

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new Error( "Missing python script for streaming provider" ),
		"Throws error on missing pythonscript for current platform"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Gets provider cache once" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

});


/**
 * Reject and resolve default standalone provider exec
 */
test( "Standalone - Default exec", async function( assert ) {

	const error = new Error( "Executables were not found" );
	const providerUserData = {};

	this.provider = "livestreamer-standalone";
	this.platform = "win32";
	this.config = {
		[ this.provider ]: {
			exec: {
				[ this.platform ]: "livestreamer.exe"
			},
			fallback: {
				[ this.platform ]: [
					"C:\\livestreamer"
				]
			}
		}
	};

	const resolveProvider = this.subject();


	// reject

	this.whichFallbackStub.throws( error );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new ProviderError( "Couldn't find executable", error ),
		"Throws a ProviderError on unresolvable file"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].exec[ this.platform ],
			this.config[ this.provider ].fallback
		]],
		"Calls whichFallback with correct exec and fallbacks"
	);
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();
	this.whichFallbackStub.reset();


	// resolve

	this.whichFallbackStub.returns( "C:\\livestreamer\\livestreamer.exe" );
	const expected = {
		exec: "C:\\livestreamer\\livestreamer.exe",
		params: null,
		env: null
	};

	assert.propEqual(
		await resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		expected,
		"Returns the correct execObj"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].exec[ this.platform ],
			this.config[ this.provider ].fallback
		]],
		"Calls whichFallback with correct exec and fallbacks"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.propEqual(
		this.setProviderCacheStub.args,
		[[ expected ]],
		"Sets up cache with correct execObj"
	);
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ],
			[ "Validated streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

});


/**
 * Reject and resolve custom standalone provider exec
 */
test( "Standalone - Custom exec", async function( assert ) {

	const error = new Error( "Executables were not found" );
	let providerUserData;

	this.provider = "livestreamer-standalone";
	this.platform = "win32";
	this.config = {
		[ this.provider ]: {
			exec: {
				[ this.platform ]: "livestreamer.exe"
			},
			fallback: {
				[ this.platform ]: [
					"C:\\livestreamer"
				]
			}
		}
	};

	const resolveProvider = this.subject();


	// reject

	providerUserData = { exec: "C:\\non-existing\\livestreamer.exe" };
	this.whichFallbackStub.throws( error );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new ProviderError( "Couldn't find executable", error ),
		"Throws a ProviderError on unresolvable file"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[ providerUserData.exec ]],
		"Calls whichFallback with correct exec and no fallbacks"
	);
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();
	this.whichFallbackStub.reset();


	// resolve

	providerUserData = { exec: "C:\\custom\\standalone.exe" };
	this.whichFallbackStub.returns( providerUserData.exec );

	const expected = {
		exec: "C:\\custom\\standalone.exe",
		params: null,
		env: null
	};
	assert.propEqual(
		await resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		expected,
		"Returns the correct execObj"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[ providerUserData.exec ]],
		"Calls whichFallback with correct exec and no fallbacks"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.propEqual(
		this.setProviderCacheStub.args,
		[[ expected ]],
		"Sets up cache with correct execObj"
	);
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ],
			[ "Validated streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

});


/**
 * Check for existing python script and validate it
 */
test( "Python - Invalid python script", async function( assert ) {

	const errorWhich = new Error( "Executables were not found" );
	const errorInterpret = new Error( "Invalid python script" );
	const providerUserData = {};

	const resolveProvider = this.subject();


	// reject (unkown python script)

	this.whichFallbackStub.throws( errorWhich );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new ProviderError( "Couldn't find python script", errorWhich ),
		"Throws a ProviderError on unresolvable file"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].pythonscript[ this.platform ],
			this.config[ this.provider ].pythonscriptfallback,
			isFile
		]],
		"Calls whichFallback with correct pythonscript, fallbacks and file check method"
	);
	assert.notOk(
		this.findPythonscriptInterpreterStub.called,
		"Doesn't call findPythonscriptInterpreter"
	);
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();
	this.whichFallbackStub.reset();


	// reject (invalid python script)

	this.whichFallbackStub.returns( "/usr/bin/streamlink" );
	this.findPythonscriptInterpreterStub.throws( errorInterpret );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new ProviderError( "Couldn't validate python script", errorInterpret ),
		"Throws a ProviderError on unresolvable pythonscript"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].pythonscript[ this.platform ],
			this.config[ this.provider ].pythonscriptfallback,
			isFile
		]],
		"Calls whichFallback with correct pythonscript, fallbacks and file check method"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/bin/streamlink",
			this.config[ this.provider ],
			undefined
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

});


/**
 * Resolve default python script and its returned executable
 */
test( "Python - Default python exec/script", async function( assert ) {

	const providerUserData = {};

	const resolveProvider = this.subject();

	this.whichFallbackStub.returns( "/usr/bin/streamlink" );
	this.findPythonscriptInterpreterStub.returns( new ExecObj( "/usr/bin/python" ) );
	const expected = new ExecObj( "/usr/bin/python", [ "/usr/bin/streamlink" ], null );

	assert.propEqual(
		await resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		expected,
		"Resolves python script and its executable"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].pythonscript[ this.platform ],
			this.config[ this.provider ].pythonscriptfallback,
			isFile
		]],
		"Only calls whichFallback once with correct pythonscript, fallbacks and file check method"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/bin/streamlink",
			this.config[ this.provider ],
			undefined
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.propEqual(
		this.setProviderCacheStub.args,
		[[ expected ]],
		"Sets up cache with correct execObj"
	);
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ],
			[ "Validated streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

});


/**
 * Resolve and reject custom python script and custom python executable
 */
test( "Python - Custom python exec/script", async function( assert ) {

	const error = new Error( "Executables were not found" );
	const providerUserData = {
		exec: "/usr/local/bin/python",
		pythonscript: "/usr/local/bin/streamlink"
	};

	this.whichFallbackStub.onCall( 0 ).returns( providerUserData.pythonscript );
	this.whichFallbackStub.onCall( 1 ).returns( providerUserData.exec );
	this.findPythonscriptInterpreterStub.returns( new ExecObj( "/usr/bin/python" ) );

	const resolveProvider = this.subject();


	// resolve

	const expected = new ExecObj( "/usr/local/bin/python", [ "/usr/local/bin/streamlink" ], null );
	assert.propEqual(
		await resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		expected,
		"Resolves python script and its executable"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[
			[
				providerUserData.pythonscript,
				this.config[ this.provider ].pythonscriptfallback,
				isFile
			],
			[
				providerUserData.exec
			]
		],
		"Calls whichFallback with custom pythonscript and fb, then with custom exec and no fb"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/local/bin/streamlink",
			this.config[ this.provider ],
			"/usr/local/bin/python"
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.propEqual(
		this.setProviderCacheStub.args,
		[[ expected ]],
		"Sets up cache with correct execObj"
	);
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ],
			[ "Validated streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

	this.isAbortedSpy.reset();
	this.getProviderCacheStub.resetHistory();
	this.logDebugSpy.reset();
	this.whichFallbackStub.resetHistory();
	this.findPythonscriptInterpreterStub.resetHistory();
	this.validateProviderStub.resetHistory();
	this.setProviderCacheStub.resetHistory();


	// reject

	this.whichFallbackStub.onCall( 1 ).throws( error );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		new ProviderError( "Couldn't find python executable", error ),
		"Throws a ProviderError on invalid custom exec"
	);
	assert.propEqual( this.isAbortedSpy.args, [[ stream ]], "Calls isAborted once" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[
			[
				providerUserData.pythonscript,
				this.config[ this.provider ].pythonscriptfallback,
				isFile
			],
			[
				providerUserData.exec
			]
		],
		"Calls whichFallback with custom pythonscript and fb, then with custom exec and no fb"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/local/bin/streamlink",
			this.config[ this.provider ],
			"/usr/local/bin/python"
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.notOk( this.validateProviderStub.called, "Doesn't validate provider" );
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[[ "Resolving streaming provider", { provider: this.provider, providerUserData } ]],
		"Logs provider name and user data"
	);

});


/**
 * Resolve python script and executable from bash wrapper script data
 */
test( "Python - Bash wrapper script", async function( assert ) {

	const providerUserData = {};
	const expected = new ExecObj(
		"/usr/bin/different-python",
		[ "/usr/bin/different-streamlink-script" ],
		{ foo: "bar" }
	);

	this.whichFallbackStub.returns( "/usr/bin/streamlink-script" );
	this.findPythonscriptInterpreterStub.returns( expected );

	const resolveProvider = this.subject();


	assert.propEqual(
		await resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		expected,
		"Resolves python script and its executable"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].pythonscript[ this.platform ],
			this.config[ this.provider ].pythonscriptfallback,
			isFile
		]],
		"Only calls whichFallback once with correct pythonscript, fallbacks and file check method"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/bin/streamlink-script",
			this.config[ this.provider ],
			undefined
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.propEqual(
		this.setProviderCacheStub.args,
		[[ expected ]],
		"Sets up cache with correct execObj"
	);
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ],
			[ "Validated streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

});


/**
 * Reject on provider validation fail
 */
test( "Provider validation", async function( assert ) {

	const error = new Error( "Validation error" );
	const providerUserData = {};

	const resolveProvider = this.subject();

	this.whichFallbackStub.returns( "/usr/bin/streamlink" );
	this.findPythonscriptInterpreterStub.returns( new ExecObj( "/usr/bin/python" ) );
	this.validateProviderStub.throws( error );
	const expected = new ExecObj( "/usr/bin/python", [ "/usr/bin/streamlink" ], null );

	await assert.rejects(
		resolveProvider( stream, this.provider, { [ this.provider ]: providerUserData } ),
		error,
		"Throws validation error"
	);
	assert.propEqual( this.isAbortedSpy.args, [ [ stream] , [ stream ] ], "Calls isAborted twice" );
	assert.ok( this.getProviderCacheStub.calledOnce, "Tries to get provider cache once" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			this.config[ this.provider ].pythonscript[ this.platform ],
			this.config[ this.provider ].pythonscriptfallback,
			isFile
		]],
		"Only calls whichFallback once with correct pythonscript, fallbacks and file check method"
	);
	assert.propEqual(
		this.findPythonscriptInterpreterStub.args,
		[[
			"/usr/bin/streamlink",
			this.config[ this.provider ],
			undefined
		]],
		"Calls findPythonscriptInterpreter"
	);
	assert.propEqual(
		this.validateProviderStub.args,
		[[ expected, this.config[ this.provider ] ]],
		"Validates the resolved provider"
	);
	assert.notOk( this.setProviderCacheStub.called, "Doesn't set provider cache" );
	assert.propEqual(
		this.logDebugSpy.args,
		[
			[ "Resolving streaming provider", { provider: this.provider, providerUserData } ],
			[ "Found streaming provider", expected ]
		],
		"Logs provider name and user data, and logs resolved and validated data"
	);

});
