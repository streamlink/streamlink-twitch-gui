import { module, test } from "qunit";
import sinon from "sinon";

import { EventEmitter } from "events";

import promiseChildProcessInjector
	from "inject-loader?-utils/StreamOutputBuffer!utils/node/child_process/promise";


module( "utils/node/child_process/promise", function( hooks ) {
	const commonArgs = [
		"foo",
		[ "bar" ],
		{ baz: "qux" }
	];

	class ChildProcess extends EventEmitter {
		constructor() {
			super();
			this.stdout = new EventEmitter();
			this.stderr = new EventEmitter();
			this.exitCode = null;
			this.killed = false;
			this.on( "exit", code => this.exitCode = code );
		}

		kill() {
			this.killed = true;
			this.emit( "exit", null, "SIGTERM" );
			return true;
		}
	}

	/** @typedef {Object} TestContextUtilsNodeChildProcessPromise */
	hooks.beforeEach( /** @this {TestContextUtilsNodeChildProcessPromise} */ function() {
		this.child = null;
		this.childKillSpy = null;
		this.spawnStub = sinon.stub().callsFake( () => {
			this.child = new ChildProcess();
			this.childKillSpy = sinon.spy( this.child, "kill" );
			return this.child;
		});
		this.setTimeoutStub = sinon.stub().returns( 1234 );
		this.clearTimeoutSpy = sinon.spy();
		this.onShutdownUnregisterSpy = sinon.spy();
		this.onShutdownRegisterStub = sinon.stub().returns( this.onShutdownUnregisterSpy );

		const { default: promiseChildProcess } = promiseChildProcessInjector({
			"nwjs/Window": {
				window: {
					setTimeout: this.setTimeoutStub,
					clearTimeout: this.clearTimeoutSpy
				}
			},
			"utils/node/onShutdown": this.onShutdownRegisterStub,
			"child_process": {
				spawn: this.spawnStub
			}
		});
		this.promiseChildProcess = promiseChildProcess;
	});


	test( "No custom listeners", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		assert.strictEqual( this.child, null, "No initial child process" );
		const promise = this.promiseChildProcess( commonArgs );

		assert.ok( this.spawnStub.calledOnceWithExactly( ...commonArgs ), "Spawns child process" );
		assert.ok( this.child instanceof ChildProcess, "Has spawned a child process" );
		assert.propEqual( this.child.eventNames(), [ "exit", "error" ], "Has correct listeners" );
		assert.propEqual( this.child.stdout.eventNames(), [], "No stdout listeners by default" );
		assert.propEqual( this.child.stderr.eventNames(), [], "No stderr listeners by default" );
		assert.ok( this.onShutdownRegisterStub.calledOnce, "Registers onShutdown kill callback" );
		assert.notOk( this.setTimeoutStub.called, "Does not set a timeout" );

		this.child.emit( "exit", 123 );
		const code = await promise;

		assert.strictEqual( code, 123, "Resolves with correct exit code" );
		assert.notOk( this.childKillSpy.called, "Does not kill if already exited" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "No custom listeners - error", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const error = new Error();
		const promise = this.promiseChildProcess( commonArgs );
		this.child.emit( "error", error );
		await assert.rejects( promise, error, "Rejects on error" );
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process on error" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "onExit", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const onExitStub = sinon.stub().callsArg( 1 );
		const promise = this.promiseChildProcess( commonArgs, onExitStub );
		assert.propEqual( this.child.eventNames(), [ "exit", "error" ], "Has correct listeners" );
		assert.propEqual( this.child.stdout.eventNames(), [], "No stdout listeners by default" );
		assert.propEqual( this.child.stderr.eventNames(), [], "No stderr listeners by default" );
		this.child.emit( "exit", 123 );
		assert.strictEqual( onExitStub.args[ 0 ][ 0 ], 123, "Executes onExit" );
		assert.ok( onExitStub.args[ 0 ][ 1 ] instanceof Function, "Resolve is a function" );
		assert.ok( onExitStub.args[ 0 ][ 2 ] instanceof Function, "Reject is a function" );
		await promise;
		assert.notOk( this.childKillSpy.called, "Does not kill if already exited" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "onExit - reject", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const error = new Error();
		const onExitStub = sinon.stub().callsArgWith( 2, error );
		const promise = this.promiseChildProcess( commonArgs, onExitStub );
		this.child.emit( "exit" );
		assert.ok( onExitStub.calledOnce, "Calls onExit callback once" );
		await assert.rejects( promise, error, "Rejects promise" );
		assert.notOk( this.childKillSpy.called, "Does not kill if already exited" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "onStdout", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const onStdOutStub = sinon.stub().callsArg( 1 );
		const promise = this.promiseChildProcess( commonArgs, null, onStdOutStub );
		assert.propEqual( this.child.eventNames(), [ "exit", "error" ], "Has correct listeners" );
		assert.propEqual( this.child.stdout.eventNames(), [ "data" ], "Has stdout listener" );
		assert.propEqual( this.child.stderr.eventNames(), [], "No stderr listeners by default" );
		this.child.stdout.emit( "data", "foo\n" );
		assert.strictEqual( onStdOutStub.args[ 0 ][ 0 ], "foo", "Executes onStdout" );
		assert.ok( onStdOutStub.args[ 0 ][ 1 ] instanceof Function, "Resolve is a function" );
		assert.ok( onStdOutStub.args[ 0 ][ 2 ] instanceof Function, "Reject is a function" );
		await promise;
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process if still running" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "onStdOut - reject", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const error = new Error();
		const onStdOutStub = sinon.stub().callsArgWith( 2, error );
		const promise = this.promiseChildProcess( commonArgs, null, onStdOutStub );
		this.child.stdout.emit( "data", "foo\n" );
		await assert.rejects( promise, error, "Rejects promise" );
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process if still running" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});


	test( "onStderr", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const onStdErrStub = sinon.stub().callsArg( 1 );
		const promise = this.promiseChildProcess( commonArgs, null, null, onStdErrStub );
		assert.propEqual( this.child.eventNames(), [ "exit", "error" ], "Has correct listeners" );
		assert.propEqual( this.child.stdout.eventNames(), [], "No stdout listeners by default" );
		assert.propEqual( this.child.stderr.eventNames(), [ "data" ], "Has stderr listener" );
		this.child.stderr.emit( "data", "foo\n" );
		assert.strictEqual( onStdErrStub.args[ 0 ][ 0 ], "foo", "Executes onStderr" );
		assert.ok( onStdErrStub.args[ 0 ][ 1 ] instanceof Function, "Resolve is a function" );
		assert.ok( onStdErrStub.args[ 0 ][ 2 ] instanceof Function, "Reject is a function" );
		await promise;
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process if still running" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "onStdErr - reject", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const error = new Error();
		const onStdErrStub = sinon.stub().callsArgWith( 2, error );
		const promise = this.promiseChildProcess( commonArgs, null, null, onStdErrStub );
		this.child.stderr.emit( "data", "foo\n" );
		await assert.rejects( promise, error, "Rejects promise" );
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process if still running" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "timeout", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const promise = this.promiseChildProcess( commonArgs, null, null, null, 2 );
		assert.ok( this.setTimeoutStub.calledOnce, "Has a timeout" );
		assert.strictEqual( this.setTimeoutStub.args[ 0 ][ 1 ], 2, "Has correct timeout value" );
		assert.notOk( this.childKillSpy.called, "Child process has not been terminated yet" );

		this.setTimeoutStub.args[ 0 ][ 0 ]();
		await promise;
		assert.ok( this.clearTimeoutSpy.calledOnce, "Clears timeout" );
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "timeout - kill", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const promise = this.promiseChildProcess( commonArgs, null, null, null, 2 );
		assert.ok( this.setTimeoutStub.calledOnce, "Has a timeout" );
		assert.strictEqual( this.setTimeoutStub.args[ 0 ][ 1 ], 2, "Has correct timeout value" );
		assert.notOk( this.childKillSpy.called, "Child process has not been terminated yet" );

		this.child.kill();
		await promise;
		assert.ok( this.clearTimeoutSpy.calledOnce, "Clears timeout" );
		assert.notOk( this.childKillSpy.calledTwice, "Does not terminate child process twice" );
		assert.ok( this.onShutdownUnregisterSpy.calledOnce, "Unregisters onShutdown kill" );
	});

	test( "Process shutdown", async function( assert ) {
		/** @this {TestContextUtilsNodeChildProcessPromise} */
		const promise = this.promiseChildProcess( commonArgs );
		assert.notOk( this.childKillSpy.called, "Child process has not been terminated yet" );

		this.onShutdownRegisterStub.args[ 0 ][ 0 ]();
		await promise;
		assert.ok( this.childKillSpy.calledOnce, "Terminates child process on shutdown" );
	});
});
