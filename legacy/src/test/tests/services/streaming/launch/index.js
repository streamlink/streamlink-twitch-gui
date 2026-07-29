import { module, test } from "qunit";
import sinon from "sinon";
import { default as EmberObject, get, getProperties, setProperties } from "@ember/object";
import { EventEmitter } from "events";

import launchProviderInjector
// eslint-disable-next-line max-len
	from "inject-loader?../is-aborted&../spawn&../provider/parameters&./parse-error&utils/parameters/Parameter!services/streaming/launch";
import {
	ExitCodeError,
	ExitSignalError,
	Warning
} from "services/streaming/errors";


module( "services/streaming/launch/index", {
	beforeEach() {
		class ChildProcess extends EventEmitter {
			constructor() {
				super();
				this.stdout = new EventEmitter();
				this.stderr = new EventEmitter();
			}
		}

		this.child = null;
		this.parameters = [];

		this.isAbortedSpy = sinon.spy();
		this.pushLogSpy = sinon.spy();
		this.killChildSpy = sinon.spy();

		this.getParametersStub = sinon.stub();
		this.parseErrorStub = sinon.stub();
		this.spawnStub = sinon.stub().callsFake( ( ...args ) => {
			this.child = new ChildProcess( ...args );
			this.child.kill = this.killChildSpy;
			return this.child;
		});

		this.Stream = EmberObject.extend({
			pushLog: this.pushLogSpy
		});

		const { default: launchProvider } = launchProviderInjector({
			"./parse-error": this.parseErrorStub,
			"../errors": {
				ExitCodeError,
				ExitSignalError,
				Warning
			},
			"../provider/parameters": {
				parameters: this.parameters
			},
			"../is-aborted": this.isAbortedSpy,
			"../spawn": this.spawnStub,
			"utils/parameters/Parameter": {
				getParameters: this.getParametersStub
			}
		});
		this.launchProvider = launchProvider;
	}
});


test( "Reset stream record", async function( assert ) {

	const stream = this.Stream.create({
		isLaunching: false,
		error: true,
		warning: true,
		log: [ 123 ]
	});
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.ok( this.isAbortedSpy.calledOnce, "Checks if user aborted launch earlier" );
	assert.propEqual(
		getProperties( stream, "isLaunching", "error", "warning", "log" ),
		{
			isLaunching: true,
			error: null,
			warning: false,
			log: []
		},
		"Resets state of the stream record"
	);

	this.child.emit( "exit", 0 );
	await promise;

});


test( "Spawn error", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "error", new Error( "failed" ) );
	await assert.rejects( promise, new Error( "failed" ), "Rejects if child emits an error" );

	assert.ok( this.killChildSpy.calledOnce, "Calls child.kill" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once rejected" );

});


test( "Exit codes", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "exit", 1 );
	this.child.killed = true;
	await assert.rejects(
		promise,
		new ExitCodeError( "Process exited with code 1" ),
		"Rejects with an ExitCodeError on codes greater than 0"
	);

	assert.notOk( this.killChildSpy.called, "Child process has already terminated" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once rejected" );

});


test( "Exit code 130 (SIGINT)", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "exit", 130 );
	this.child.killed = true;
	await promise;

	assert.notOk( this.killChildSpy.called, "Child process has already terminated" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once resolved" );

});


test( "SIGTERM", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "exit", null, "SIGTERM" );
	this.child.killed = true;
	await promise;

	assert.notOk( this.killChildSpy.called, "Child process has already terminated" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once resolved" );

});


test( "SIGINT", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "exit", null, "SIGINT" );
	this.child.killed = true;
	await promise;

	assert.notOk( this.killChildSpy.called, "Child process has already terminated" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once resolved" );

});


test( "Signals", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.emit( "exit", null, "SIGKILL" );
	this.child.killed = true;

	await assert.rejects(
		promise,
		new ExitSignalError( "Process exited with signal SIGKILL" ),
		"Rejects with an ExitSignalError if a signal name was set"
	);

	assert.notOk( this.killChildSpy.called, "Child process has already terminated" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once rejected" );

});


test( "Stdout message", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.stdout.emit( "data", "[cli][info] foo\n" );
	this.child.stdout.emit( "data", "[plugin.foo][bar] baz\n" );

	this.child.emit( "exit", 0 );
	await promise;

	assert.propEqual(
		this.pushLogSpy.args,
		[
			[
				"stdOut",
				"foo"
			],
			[
				"stdOut",
				"baz"
			]
		],
		"Adds stdOut messages to the log"
	);

});


test( "Stdout error message", async function( assert ) {

	this.parseErrorStub.callsFake( data => new Error( data ) );

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.stdout.emit( "data", "error: No streams found on this URL: foo\n" );

	await assert.rejects(
		promise,
		new Error( "error: No streams found on this URL: foo" ),
		"Rejects on stdout error"
	);
	assert.propEqual(
		this.pushLogSpy.args,
		[[
			"stdErr",
			"error: No streams found on this URL: foo"
		]],
		"Adds stdOut error messages to the error log"
	);

	assert.ok( this.killChildSpy.calledOnce, "Calls child.kill" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once rejected" );

});


test( "Stderr message", async function( assert ) {

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	this.child.stderr.emit( "data", "foo\n" );

	await assert.rejects(
		promise,
		new Error( "foo" ),
		"Rejects on stderr messages"
	);
	assert.propEqual(
		this.pushLogSpy.args,
		[[
			"stdErr",
			"foo"
		]],
		"Adds stdErr messages to the error log"
	);

	assert.ok( this.killChildSpy.calledOnce, "Calls child.kill" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once rejected" );

});


test( "Warnings", async function( assert ) {

	this.parseErrorStub.callsFake( () => new Warning() );

	const stream = this.Stream.create({
		warning: false
	});
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	this.child.stdout.emit( "data", "foo\n" );

	assert.strictEqual(
		get( stream, "warning" ),
		true,
		"stream.warning is true on parsed warnings"
	);
	assert.propEqual(
		this.pushLogSpy.args,
		[[
			"stdErr",
			"foo"
		]],
		"Adds warning to error log"
	);

	this.child.emit( "exit", 0 );
	await promise;

});


test( "Parameters", async function( assert ) {

	const provider = {};
	const player = {};

	this.getParametersStub.returns([ "foo" ]);

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, provider, player, () => {} );

	const [ context, parameters ] = this.getParametersStub.args[0];
	assert.strictEqual( context.stream, stream, "Has the stream context" );
	assert.strictEqual( context.player, player, "Has the player context" );
	assert.strictEqual( parameters, this.parameters, "Uses the correct parameters definition" );

	const [ providerObject, providerParams, providerOptions ] = this.spawnStub.args[0];
	assert.strictEqual( providerObject, provider, "Uses correct provider object" );
	assert.propEqual( providerParams, [ "foo" ], "Uses correct provider params" );
	assert.propEqual( providerOptions, { detached: true }, "Uses correct spawn options" );

	this.child.emit( "exit", 0 );
	await promise;

});


test( "Success callback", async function( assert ) {

	const onSuccessSpy = sinon.spy();

	const stream = this.Stream.create();
	const promise = this.launchProvider( stream, {}, {}, onSuccessSpy );

	this.child.stdout.emit( "data", "foo\n" );
	assert.notOk( onSuccessSpy.called, "Hasn't executed onSuccess callback yet" );

	this.child.stdout.emit( "data", "[cli][info] Starting player: /foo/bar\n" );
	assert.ok( onSuccessSpy.calledOnce, "Has executed onSuccess callback" );

	this.child.emit( "exit", 0 );
	await promise;

});


test( "Quality change", async function( assert ) {

	let oldChild;

	const stream = this.Stream.create({
		quality: "foo",
		isLaunching: false,
		isCompleted: false
	});
	const promise = this.launchProvider( stream, {}, {}, () => {} );

	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );
	oldChild = this.child;

	setProperties( stream, {
		quality: "bar",
		isLaunching: false
	});
	this.child.emit( "exit", 0 );
	assert.notOk( get( stream, "isCompleted" ), "stream is not completed on first change" );
	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	assert.notStrictEqual( stream.spawn, oldChild, "stream.spawn is a new child process" );
	oldChild = this.child;

	setProperties( stream, {
		quality: "foo",
		isLaunching: false
	});
	this.child.emit( "exit", 0 );
	assert.notOk( get( stream, "isCompleted" ), "stream is not completed on second change" );
	assert.strictEqual( stream.spawn, this.child, "stream.spawn is the child object" );

	assert.notStrictEqual( stream.spawn, oldChild, "stream.spawn is a new child process" );

	this.child.emit( "exit", 0 );
	await promise;

	assert.strictEqual( get( stream, "isCompleted" ), true, "stream is completed once resolved" );
	assert.strictEqual( stream.spawn, null, "stream.spawn is null once resolved" );

	assert.ok( this.isAbortedSpy.calledOnce, "Only checks once if user aborted launch earlier" );
	assert.strictEqual( this.spawnStub.callCount, 3, "Has launched stream 3 times" );

});
