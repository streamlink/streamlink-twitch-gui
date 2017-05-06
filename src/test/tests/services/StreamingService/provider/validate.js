import {
	module,
	test
} from "qunit";
import validateProviderInjector from "inject-loader!services/StreamingService/provider/validate";
import spawnInjector from "inject-loader!services/StreamingService/spawn";
import {
	LogError,
	ProviderError,
	VersionError
} from "services/StreamingService/errors";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { EventEmitter } from "events";


const { assign } = Object;
const logger = {
	logDebug() {}
};
const commonValidateProviderDeps = {
	"../errors": {
		LogError,
		ProviderError,
		VersionError
	},
	"utils/semver": {
		getMax
	},
	"utils/StreamOutputBuffer": StreamOutputBuffer
};

class ChildProcess extends EventEmitter {
	constructor( exec, params, options ) {
		super();
		this.exec = exec;
		this.params = params;
		this.options = options;
		this.stdout = new EventEmitter();
		this.stderr = new EventEmitter();
	}
}


module( "services/StreamingService/provider/validate" );


test( "Invalid exec", async assert => {

	assert.expect( 16 );

	let child;
	const execObj = { exec: "foo" };

	const validateProvider = validateProviderInjector( assign({
		"config": {
			streamprovider: {
				"validation-timeout": 5,
				"version-min": {}
			}
		},
		"../spawn": spawnInjector({
			"./logger": logger,
			"utils/node/child_process/spawn": function() {
				child = new class extends ChildProcess {
					kill() {
						assert.ok( true, "Calls child.kill" );
					}
				}( ...arguments );
				return child;
			}
		})[ "default" ]
	}, commonValidateProviderDeps ) )[ "default" ];

	try {
		const promise = validateProvider( execObj );
		assert.strictEqual( child.exec, "foo", "Child has the correct exec property" );
		assert.deepEqual(
			child.params,
			[ "--version", "--no-version-check" ],
			"Child has the correct params property"
		);
		child.emit( "error", new Error( "foo" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "foo", "Rejects on error" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stdout.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws an LogError on unexpected output on stdout" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stdout.emit( "data", "streamlink 1.0.0\n\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws an LogError on unexpected output on stdout" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws an LogError on unexpected output on stderr" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink 1.0.0\n\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws an LogError on unexpected output on stderr" );
	}

	try {
		const promise = validateProvider( execObj );
		child.emit( "exit", 1 );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Exit code 1", "Rejects on exit codes greater than 0" );
	}

	try {
		const promise = validateProvider( execObj );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Timeout", "Rejects on timeout" );
	}

});


test( "Invalid provider or version", async assert => {

	assert.expect( 5 );

	let child;
	const execObj = { exec: "foo" };

	const validateProvider = validateProviderInjector( assign({
		"config": {
			streamprovider: {
				"validation-timeout": 5,
				"version-min": {
					streamlink: "2.0.0"
				}
			}
		},
		"../spawn": spawnInjector({
			"./logger": logger,
			"utils/node/child_process/spawn": function() {
				child = new class extends ChildProcess {
					kill() {
						assert.ok( true, "Calls child.kill" );
					}
				}( ...arguments );
				return child;
			}
		})[ "default" ]
	}, commonValidateProviderDeps ) )[ "default" ];

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "livestreamer 1.0.0\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof ProviderError, "Throws a ProviderError on invalid provider" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink 1.0.0\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof VersionError, "Throws a VersionError on invalid version" );
		assert.strictEqual( e.message, "1.0.0", "VersionError does have the correct version" );
	}

});


test( "Valid provider and version", async assert => {

	assert.expect( 15 );

	let child;
	const execObj = { exec: "foo" };

	const validateProvider = validateProviderInjector( assign({
		"config": {
			streamprovider: {
				"validation-timeout": 5,
				"version-min": {
					streamlink: "1.0.0",
					livestreamer: "1.0.0"
				}
			}
		},
		"../spawn": spawnInjector({
			"./logger": logger,
			"utils/node/child_process/spawn": function() {
				child = new class extends ChildProcess {
					kill() {
						assert.ok( true, "Calls child.kill" );
					}
				}( ...arguments );
				return child;
			}
		})[ "default" ]
	}, commonValidateProviderDeps ) )[ "default" ];

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink 1.0.0\n" );
		const { name, version } = await promise;
		assert.strictEqual( name, "streamlink", "Returns correct provider name" );
		assert.strictEqual( version, "1.0.0", "Returns correct provider version" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "livestreamer 1.0.0\n" );
		const { name, version } = await promise;
		assert.strictEqual( name, "livestreamer", "Returns correct provider name" );
		assert.strictEqual( version, "1.0.0", "Returns correct provider version" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink-script.py 1.0.0\n" );
		const { name, version } = await promise;
		assert.strictEqual( name, "streamlink", "Returns correct provider name" );
		assert.strictEqual( version, "1.0.0", "Returns correct provider version" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink-script.pyw 1.0.0\n" );
		const { name, version } = await promise;
		assert.strictEqual( name, "streamlink", "Returns correct provider name" );
		assert.strictEqual( version, "1.0.0", "Returns correct provider version" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const promise = validateProvider( execObj );
		child.stderr.emit( "data", "streamlink.exe 1.0.0\n" );
		const { name, version } = await promise;
		assert.strictEqual( name, "streamlink", "Returns correct provider name" );
		assert.strictEqual( version, "1.0.0", "Returns correct provider version" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

});
