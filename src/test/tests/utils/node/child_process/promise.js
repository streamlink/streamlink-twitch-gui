import { module, test } from "qunit";
import { EventEmitter } from "events";

import promiseChildProcessInjector
	from "inject-loader?-utils/StreamOutputBuffer!utils/node/child_process/promise";


class ChildProcess extends EventEmitter {
	constructor() {
		super();
		this.stdout = new EventEmitter();
		this.stderr = new EventEmitter();
	}
}

let childArgs, child, promiseChildProcess, shutdown, timeout;


module( "utils/node/child_process/promise", {
	beforeEach( assert ) {
		childArgs = [
			"foo",
			[ "bar" ],
			{ baz: "qux" }
		];

		promiseChildProcess = promiseChildProcessInjector({
			"nwjs/Window": {
				window: {
					setTimeout( callback, time ) {
						assert.step( "setTimeout" );
						assert.ok( callback instanceof Function, "Has a callback" );
						assert.strictEqual( time, 2, "Sets the correct time" );
						timeout = callback;
						return 1234;
					},
					clearTimeout() {
						assert.step( "clearTimeout" );
						timeout = null;
					}
				}
			},
			"utils/node/onShutdown": callback => {
				shutdown = callback;
				assert.ok( callback instanceof Function, "Registers shutdown listeners" );
				return () => {
					assert.step( "unregister onShutdown" );
				};
			},
			"child_process": {
				spawn( ...args ) {
					assert.propEqual( args, childArgs, "Calls spawn" );
					child = new class extends ChildProcess {
						kill() {
							assert.step( "kill" );
							child.emit( "exit", 0 );
						}
					}();
					return child;
				}
			}
		})[ "default" ];
	},
	afterEach() {
		childArgs = child = promiseChildProcess = shutdown = timeout = null;
	}
});


test( "No custom listeners", async assert => {

	assert.expect( 15 );

	const promise = promiseChildProcess( childArgs );
	assert.propEqual( child.eventNames(), [ "error", "exit" ], "Registers the correct listeners" );
	assert.propEqual( child.stdout.eventNames(), [], "No stdout listeners by default" );
	assert.propEqual( child.stderr.eventNames(), [], "No stderr listeners by default" );
	child.emit( "exit", 123 );
	const code = await promise;
	assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );
	assert.strictEqual( code, 123, "Resolves with correct exit code" );

	try {
		const promise = promiseChildProcess( childArgs );
		child.emit( "error", new Error( "fail" ) );
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );
		assert.strictEqual( e.message, "fail", "Rejects on error" );
	}

});


test( "onExit", async assert => {

	assert.expect( 17 );

	const promise = promiseChildProcess( childArgs, ( code, resolve, reject ) => {
		assert.strictEqual( code, 123, "Executes onExit" );
		assert.ok( resolve instanceof Function, "Resolve is a function" );
		assert.ok( reject instanceof Function, "Reject is a function" );
		resolve();
	});
	assert.propEqual( child.eventNames(), [ "error", "exit" ], "Registers the correct listeners" );
	assert.propEqual( child.stdout.eventNames(), [], "No stdout listeners by default" );
	assert.propEqual( child.stderr.eventNames(), [], "No stderr listeners by default" );
	child.emit( "exit", 123 );
	await promise;
	assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );

	try {
		const promise = promiseChildProcess( childArgs, ( code, resolve, reject ) => {
			reject( new Error( "fail" ) );
		});
		child.emit( "exit" );
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );
		assert.strictEqual( e.message, "fail", "Rejects promise" );
	}

});


test( "onStdout", async assert => {

	assert.expect( 17 );

	const promise = promiseChildProcess( childArgs, null, ( line, resolve, reject ) => {
		assert.strictEqual( line, "foo", "Executes onStdout" );
		assert.ok( resolve instanceof Function, "Resolve is a function" );
		assert.ok( reject instanceof Function, "Reject is a function" );
		resolve();
	});
	assert.propEqual( child.eventNames(), [ "error", "exit" ], "Registers the correct listeners" );
	assert.propEqual( child.stdout.eventNames(), [ "data" ], "Has stdout listener registered" );
	assert.propEqual( child.stderr.eventNames(), [], "No stderr listeners by default" );
	child.stdout.emit( "data", "foo\n" );
	await promise;
	assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );

	try {
		const promise = promiseChildProcess( childArgs, null, ( line, resolve, reject ) => {
			reject( new Error( "fail" ) );
		});
		child.stdout.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );
		assert.strictEqual( e.message, "fail", "Rejects promise" );
	}

});


test( "onStderr", async assert => {

	assert.expect( 17 );

	const promise = promiseChildProcess( childArgs, null, null, ( line, resolve, reject ) => {
		assert.strictEqual( line, "foo", "Executes onStderr" );
		assert.ok( resolve instanceof Function, "Resolve is a function" );
		assert.ok( reject instanceof Function, "Reject is a function" );
		resolve();
	});
	assert.propEqual( child.eventNames(), [ "error", "exit" ], "Registers the correct listeners" );
	assert.propEqual( child.stdout.eventNames(), [], "No stdout listeners by default" );
	assert.propEqual( child.stderr.eventNames(), [ "data" ], "Has stderr listener registered" );
	child.stderr.emit( "data", "foo\n" );
	await promise;
	assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );

	try {
		const promise = promiseChildProcess( childArgs, null, null, ( line, resolve, reject ) => {
			reject( new Error( "fail" ) );
		});
		child.stderr.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );
		assert.strictEqual( e.message, "fail", "Rejects promise" );
	}

});


test( "timeout", async assert => {

	assert.expect( 19 );

	let promise;

	promise = promiseChildProcess( childArgs, null, null, null, 2 );
	child.kill();
	await promise;
	// steps are a bit weird here due to the kill method mock
	assert.checkSteps(
		[ "setTimeout", "kill", "clearTimeout", "kill", "unregister onShutdown" ],
		"Clears timeout, kills process and unregisters"
	);

	promise = promiseChildProcess( childArgs, null, null, null, 2 );
	timeout();
	await promise;
	// steps are a bit weird here due to the kill method mock
	assert.checkSteps(
		[ "setTimeout", "clearTimeout", "kill", "unregister onShutdown" ],
		"Executes timeout callback, kills process and unregisters"
	);

});


test( "Process shutdown", async assert => {

	assert.expect( 5 );

	const promise = promiseChildProcess( childArgs );
	shutdown();
	await promise;
	assert.checkSteps( [ "kill", "unregister onShutdown" ], "Kills process and unregisters" );

});
