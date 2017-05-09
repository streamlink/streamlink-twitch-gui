import {
	module,
	test
} from "qunit";
import {
	get,
	getProperties,
	setProperties,
	run,
	EmberObject
} from "ember";
import launchProviderInjector from "inject-loader?-ember!services/StreamingService/launch";
import { Warning } from "services/StreamingService/errors";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { EventEmitter } from "events";


const { assign } = Object;
const parameters = [];
const commonDeps = {
	"../errors": {
		Warning
	},
	"../provider/parameters": {
		parameters
	},
	"utils/StreamOutputBuffer": StreamOutputBuffer
};

class ChildProcess extends EventEmitter {
	constructor() {
		super();
		this.stdout = new EventEmitter();
		this.stderr = new EventEmitter();
	}
}


module( "services/StreamingService/launch/index" );


test( "Reject", async assert => {

	assert.expect( 23 );

	const Stream = EmberObject.extend({
		pushLog: ( ...args ) => pushLog( ...args )
	});
	const provider = {};
	const player = {};

	let stream;
	let child;
	let parseError;
	let pushLog;

	const launchProvider = launchProviderInjector( assign( {}, commonDeps, {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../spawn": ( ...args ) => {
			child = new class extends ChildProcess {
				kill() {
					assert.ok( true, "Calls child.kill" );
				}
			}( ...args );
			return child;
		},
		"./parse-error": ( ...args ) => parseError( ...args ),
		"utils/parameters/Parameter": {
			getParameters() {}
		}
	}) )[ "default" ];

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {} );
		assert.strictEqual(
			get( stream, "spawn" ),
			child,
			"stream.spawn is the child object"
		);
		child.emit( "error", new Error() );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof Error, "Rejects if child emits an error" );
		assert.strictEqual(
			get( stream, "spawn" ),
			null,
			"stream.spawn is null once resolved"
		);
	}

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {} );
		child.emit( "exit", 1 );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof Error, "Rejects if child exits with a code greater than 0" );
		assert.strictEqual(
			e.message,
			"Process exited with code 1",
			"Error has the correct message"
		);
	}

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {} );
		child.emit( "exit", null, "SIGKILL" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof Error, "Rejects if child exits with a signal" );
		assert.strictEqual(
			e.message,
			"Process exited with signal SIGKILL",
			"Error has the correct message"
		);
	}

	parseError = data => new Error( data );
	pushLog = ( channel, line ) => {
		assert.strictEqual( channel, "stdErr", "Adds message to stdErr if it was an error" );
		assert.strictEqual(
			line,
			"error: No streams found on this URL: foo",
			"Calls pushLog on stdout"
		);
	};

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {} );
		child.stdout.emit( "data", "error: No streams found on this URL: foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof Error, "Rejects on stdout error messages" );
		assert.strictEqual(
			e.message,
			"error: No streams found on this URL: foo",
			"Error has the correct message"
		);
	}

	pushLog = ( channel, line ) => {
		assert.strictEqual( channel, "stdErr", "Adds message to stdErr if it was an error" );
		assert.strictEqual( line, "foo", "Calls pushLog on stderr" );
	};

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {} );
		child.stderr.emit( "data", "foo\n" );
		await promise;
	} catch ( e ) {
		assert.ok( e instanceof Error, "Rejects on stderr messages" );
		assert.strictEqual( e.message, "foo", "Error has the correct message" );
	}

});


test( "Resolve", async assert => {

	assert.expect( 29 );

	const Stream = EmberObject.extend({
		pushLog: ( ...args ) => pushLog( ...args )
	});
	const provider = {};
	const player = {};

	let stream;
	let child;
	let pushLog = () => {};
	let parseError = () => {};

	const launchProvider = launchProviderInjector( assign( {}, commonDeps, {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../spawn": ( providerObj, params, options ) => {
			assert.strictEqual( providerObj, provider, "Uses correct provider object" );
			assert.propEqual( params, [ "foo" ], "Uses correct provider params" );
			assert.propEqual( options, { detached: true }, "Uses correct spawn options" );

			return child = new class extends ChildProcess {
				kill() {
					throw new Error( "Never calls child.kill() if it has terminated already" );
				}
			}();
		},
		"./parse-error": ( ...args ) => parseError( ...args ),
		"utils/parameters/Parameter": {
			getParameters( context, params ) {
				assert.strictEqual( context.stream, stream, "Uses the stream context" );
				assert.propEqual(
					getProperties( context.stream, "isLaunching", "error", "warning", "log" ),
					{
						isLaunching: true,
						error: null,
						warning: false,
						log: []
					},
					"Resets stream properties on launch"
				);
				assert.strictEqual( context.player, player, "Uses the player context" );
				assert.strictEqual( params, parameters, "Uses the correct parameters" );
				return [ "foo" ];
			}
		}
	}) )[ "default" ];

	try {
		stream = Stream.create({
			isCompleted: false
		});
		const promise = launchProvider( stream, provider, player, () => {} );
		assert.strictEqual(
			get( stream, "spawn" ),
			child,
			"stream.spawn is the child object"
		);
		child.emit( "exit", 0 );
		await promise;
		assert.strictEqual(
			get( stream, "isCompleted" ),
			true,
			"stream.isCompleted is true once resolved"
		);
		assert.strictEqual(
			get( stream, "spawn" ),
			null,
			"stream.spawn is null once resolved"
		);
	} catch ( e ) {
		throw e;
	}

	try {
		stream = Stream.create();
		const promise = launchProvider( stream, provider, player, () => {
			assert.ok( true, "Executes onSuccess callback" );
		});
		child.stdout.emit( "data", "[cli][info] Starting player: /foo/bar\n" );
		child.emit( "exit", 0 );
		await promise;
	} catch ( e ) {
		throw e;
	}

	parseError = () => new Warning();

	try {
		stream = Stream.create({
			warning: false
		});
		const promise = launchProvider( stream, provider, player, () => {} );
		child.stdout.emit( "data", "foo\n" );
		assert.strictEqual(
			get( stream, "warning" ),
			true,
			"stream.warning is true on parsed warnings"
		);
		child.emit( "exit", 0 );
		await promise;
	} catch ( e ) {
		throw e;
	}

});


test( "Quality change", async assert => {

	assert.expect( 26 );

	const Stream = EmberObject.extend({
		pushLog: ( ...args ) => pushLog( ...args )
	});
	const provider = {};
	const player = {};

	let stream;
	let child;
	let pushLog = () => {};
	let parseError = () => {};

	const launchProvider = launchProviderInjector( assign( {}, commonDeps, {
		"../is-aborted": obj => {
			assert.strictEqual( obj, stream, "Calls isAborted" );
		},
		"../spawn": ( providerObj, params, options ) => {
			assert.strictEqual( providerObj, provider, "Uses correct provider object" );
			assert.propEqual( params, [ "foo" ], "Uses correct provider params" );
			assert.propEqual( options, { detached: true }, "Uses correct spawn options" );

			return child = new class extends ChildProcess {
				kill() {
					throw new Error( "Never calls child.kill() if it has terminated already" );
				}
			}();
		},
		"./parse-error": ( ...args ) => parseError( ...args ),
		"utils/parameters/Parameter": {
			getParameters( context, params ) {
				assert.strictEqual( context.stream, stream, "Uses the stream context" );
				assert.propEqual(
					getProperties( context.stream, "isLaunching", "error", "warning", "log" ),
					{
						isLaunching: true,
						error: null,
						warning: false,
						log: []
					},
					"Resets stream properties on launch"
				);
				assert.strictEqual( context.player, player, "Uses the player context" );
				assert.strictEqual( params, parameters, "Uses the correct parameters" );
				return [ "foo" ];
			}
		}
	}) )[ "default" ];

	try {
		stream = Stream.create({
			quality: "foo",
			isLaunching: false,
			isCompleted: false
		});
		const promise = launchProvider( stream, provider, player, () => {} );
		run( () => {
			setProperties( stream, {
				quality: "bar",
				isLaunching: false
			});
		});
		child.emit( "exit", 0 );
		assert.strictEqual(
			get( stream, "isCompleted" ),
			false,
			"stream.isCompleted stays false on first quality change"
		);
		run( () => {
			setProperties( stream, {
				quality: "foo",
				isLaunching: false
			});
		});
		child.emit( "exit", 0 );
		assert.strictEqual(
			get( stream, "isCompleted" ),
			false,
			"stream.isCompleted stays false on a second quality change"
		);
		child.emit( "exit", 0 );
		await promise;
		assert.strictEqual(
			get( stream, "isCompleted" ),
			true,
			"stream.isCompleted is true once resolved"
		);
		assert.strictEqual(
			get( stream, "spawn" ),
			null,
			"stream.spawn is null once resolved"
		);
	} catch ( e ) {
		throw e;
	}

});
