import {
	module,
	test
} from "qunit";
import { streamprovider } from "config";
import validateProviderInjector from "inject-loader!services/StreamingService/provider/validate";
import spawnInjector from "inject-loader!services/StreamingService/spawn";
import {
	LogError,
	VersionError
} from "services/StreamingService/errors";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { EventEmitter } from "events";


const { assign } = Object;
const {
	validation: {
		providers: validationProviders
	}
} = streamprovider;
const logger = {
	logDebug() {}
};
const commonValidateProviderDeps = {
	"../errors": {
		LogError,
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


test( "Missing provider data", async assert => {

	assert.expect( 4 );

	const deps = assign({
		"../spawn": () => {}
	}, commonValidateProviderDeps );

	try {
		const { default: validateProvider } = validateProviderInjector( assign({
			"config": {
				streamprovider: {
					validation: {
						timeout: 1,
						providers: {}
					}
				}
			}
		}, deps ) );
		await validateProvider( {}, { type: "streamlink", flavor: "default" } );
	} catch ( e ) {
		assert.ok( e instanceof Error, "Throws an Error" );
		assert.strictEqual(
			e.message,
			"Missing provider validation data",
			"Error has the correct message"
		);
	}

	try {
		const { default: validateProvider } = validateProviderInjector( assign({
			"config": {
				streamprovider: {
					validation: {
						timeout: 1,
						providers: {
							streamlink: {}
						}
					}
				}
			}
		}, deps ) );
		await validateProvider( {}, { type: "streamlink", flavor: "default" } );
	} catch ( e ) {
		assert.ok( e instanceof Error, "Throws an Error" );
		assert.strictEqual(
			e.message,
			"Invalid provider validation data",
			"Error has the correct message"
		);
	}

});


test( "Invalid exec", async assert => {

	assert.expect( 20 );

	let child;
	const execObj = { exec: "foo" };
	const conf = { type: "streamlink", flavor: "default" };

	const validateProvider = validateProviderInjector( assign({
		"config": {
			streamprovider: {
				validation: {
					timeout: 5,
					providers: {
						streamlink: {
							version: "1.0.0",
							regexp: "(\\d+\\.\\d+\\.\\d+)"
						}
					}
				}
			}
		},
		"../spawn": spawnInjector({
			"./logger": logger,
			"utils/node/child_process/spawn": ( ...args ) => {
				child = new class extends ChildProcess {
					kill() {
						assert.ok( true, "Calls child.kill" );
					}
				}( ...args );
				return child;
			}
		})[ "default" ]
	}, commonValidateProviderDeps ) )[ "default" ];

	try {
		const promise = validateProvider( execObj, conf );
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
		const promise = validateProvider( execObj, conf );
		child.stdout.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws a LogError on unexpected output on stdout" );
		assert.strictEqual( e.message, "Invalid version check output", "Correct error message" );
	}

	try {
		const promise = validateProvider( execObj, conf );
		child.stdout.emit( "data", "1.0.0\n\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws a LogError on unexpected output on stdout" );
		assert.strictEqual( e.message, "Unexpected version check output", "Correct error message" );
	}

	try {
		const promise = validateProvider( execObj, conf );
		child.stderr.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws a LogError on unexpected output on stderr" );
		assert.strictEqual( e.message, "Invalid version check output", "Correct error message" );
	}

	try {
		const promise = validateProvider( execObj, conf );
		child.stderr.emit( "data", "1.0.0\n\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws a LogError on unexpected output on stderr" );
		assert.strictEqual( e.message, "Unexpected version check output", "Correct error message" );
	}

	try {
		const promise = validateProvider( execObj, conf );
		child.emit( "exit", 1 );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Exit code 1", "Rejects on exit codes greater than 0" );
	}

	try {
		const promise = validateProvider( execObj, conf );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Timeout", "Rejects on timeout" );
	}

});


test( "Version output matching", async assert => {

	assert.expect( 34 );

	let child;
	const execObj = { exec: "foo" };

	const { default: validateProvider } = validateProviderInjector( assign({
		"config": {
			streamprovider: {
				validation: {
					timeout: 5,
					providers: validationProviders
				}
			}
		},
		"../spawn": spawnInjector({
			"./logger": logger,
			"utils/node/child_process/spawn": ( ...args ) => {
				child = new class extends ChildProcess {
					kill() {
						assert.ok( true, "Calls child.kill" );
					}
				}( ...args );
				return child;
			}
		})[ "default" ]
	}, commonValidateProviderDeps ) );

	const streamlinkDefault = { type: "streamlink", flavor: "default" };
	const livestreamerDefault = { type: "livestreamer", flavor: "default" };
	const livestreamerStandalone = { type: "livestreamer", flavor: "standalone" };

	// reject

	try {
		const promise = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "livestreamer 0.0.0\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof LogError, "Throws a LogError on invalid streamlink output" );
	}

	try {
		const promise = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink 0.0.0\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof VersionError, "Throws a VersionError on old streamlink output" );
	}

	// resolve

	try {
		const promise1 = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink 100.0.0\n" );
		const { version: version1 } = await promise1;
		assert.strictEqual( version1, "100.0.0", "Matches simple streamlink output" );

		const promise2 = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink.exe 100.0.0\n" );
		const { version: version2 } = await promise2;
		assert.strictEqual( version2, "100.0.0", "Matches streamlink exe on Windows" );

		const promise3 = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink-script.py 100.0.0\n" );
		const { version: version3 } = await promise3;
		assert.strictEqual( version3, "100.0.0", "Matches streamlink python script" );

		const promise4 = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink-script.pyw 100.0.0\n" );
		const { version: version4 } = await promise4;
		assert.strictEqual( version4, "100.0.0", "Matches streamlink python script" );

		const promise5 = validateProvider( execObj, streamlinkDefault );
		child.stderr.emit( "data", "streamlink 100.0.0 foobar\n" );
		const { version: version5 } = await promise5;
		assert.strictEqual( version5, "100.0.0", "Matches streamlink output with added content" );
	} catch ( error ) {
		throw error;
	}

	try {
		const promise1 = validateProvider( execObj, livestreamerDefault );
		child.stderr.emit( "data", "livestreamer 100.0.0\n" );
		const { version: version1 } = await promise1;
		assert.strictEqual( version1, "100.0.0", "Matches simple livestreamer output" );

		const promise2 = validateProvider( execObj, livestreamerDefault );
		child.stderr.emit( "data", "livestreamer.exe 100.0.0\n" );
		const { version: version2 } = await promise2;
		assert.strictEqual( version2, "100.0.0", "Matches livestreamer exe on Windows" );

		const promise3 = validateProvider( execObj, livestreamerDefault );
		child.stderr.emit( "data", "livestreamer-script.py 100.0.0\n" );
		const { version: version3 } = await promise3;
		assert.strictEqual( version3, "100.0.0", "Matches livestreamer python script" );

		const promise4 = validateProvider( execObj, livestreamerDefault );
		child.stderr.emit( "data", "livestreamer-script.pyw 100.0.0\n" );
		const { version: version4 } = await promise4;
		assert.strictEqual( version4, "100.0.0", "Matches livestreamer python script" );

		const promise5 = validateProvider( execObj, livestreamerDefault );
		child.stderr.emit( "data", "livestreamer 100.0.0 foobar\n" );
		const { version: version5 } = await promise5;
		assert.strictEqual( version5, "100.0.0", "Matches livestreamer output with added content" );
	} catch ( error ) {
		throw error;
	}

	try {
		const promise1 = validateProvider( execObj, livestreamerStandalone );
		child.stderr.emit( "data", "livestreamer 100.0.0\n" );
		const { version: version1 } = await promise1;
		assert.strictEqual( version1, "100.0.0", "Matches simple livestreamer output" );

		const promise2 = validateProvider( execObj, livestreamerStandalone );
		child.stderr.emit( "data", "livestreamer.exe 100.0.0\n" );
		const { version: version2 } = await promise2;
		assert.strictEqual( version2, "100.0.0", "Matches livestreamer exe on Windows" );

		const promise3 = validateProvider( execObj, livestreamerStandalone );
		child.stderr.emit( "data", "livestreamer-script.py 100.0.0\n" );
		const { version: version3 } = await promise3;
		assert.strictEqual( version3, "100.0.0", "Matches livestreamer python script" );

		const promise4 = validateProvider( execObj, livestreamerStandalone );
		child.stderr.emit( "data", "livestreamer-script.pyw 100.0.0\n" );
		const { version: version4 } = await promise4;
		assert.strictEqual( version4, "100.0.0", "Matches livestreamer python script" );

		const promise5 = validateProvider( execObj, livestreamerStandalone );
		child.stderr.emit( "data", "livestreamer 100.0.0 foobar\n" );
		const { version: version5 } = await promise5;
		assert.strictEqual( version5, "100.0.0", "Matches livestreamer output with added content" );
	} catch ( error ) {
		throw error;
	}

});
