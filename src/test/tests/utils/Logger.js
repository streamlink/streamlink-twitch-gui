/* eslint-disable no-global-assign */
import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import { posix as path } from "path";

import loggerInjector from "inject-loader?-moment&-util!utils/Logger";


module( "utils/Logger", function( hooks ) {
	/** @typedef {Object} TestContextUtilsLogger */

	setupTest( hooks, {
		resolver: buildResolver( {} )
	});

	hooks.beforeEach( /** @this {TestContextUtilsLogger} */ function( assert ) {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			target: window
		});

		const fakeWrite = ( message, callback ) => callback();
		this.stdOutStub = sinon.stub().callsFake( fakeWrite );
		this.stdErrStub = sinon.stub().callsFake( fakeWrite );

		this.mkdirpStub = sinon.stub().resolves();
		this.clearfolderStub = sinon.stub().resolves();
		this.appendFileStub = sinon.stub().resolves();

		// noinspection JSValidateTypes
		/**
		 * @param {string?} loglevel
		 * @param {boolean?} logfile
		 * @param {boolean?} isDebug
		 * @return {{
		 *   default: Logger,
		 *   log: Function,
		 *   LOG_LEVEL_NONE: string,
		 *   LOG_LEVEL_ERROR: string,
		 *   LOG_LEVEL_DEBUG: string,
		 *   LISTEN_TO_ERROR: boolean,
		 *   LISTEN_TO_DEBUG: boolean
		 * }}
		 */
		this.subject = ( loglevel = "", logfile = false, isDebug = false ) =>
			loggerInjector({
				"config": {
					log: {
						filename: "[file.log]",
						maxAgeDays: 1
					}
				},
				"nwjs/argv": {
					argv: { loglevel, logfile },
					ARG_LOGFILE: "logfile",
					ARG_LOGLEVEL: "loglevel"
				},
				"nwjs/debug": { isDebug },
				"nwjs/process": {
					stdout: {
						write: this.stdOutStub
					},
					stderr: {
						write: this.stdErrStub
					}
				},
				"utils/node/platform": { logdir: "/logs" },
				"utils/node/fs/mkdirp": this.mkdirpStub,
				"utils/node/fs/clearfolder": this.clearfolderStub,
				"fs/promises": { appendFile: this.appendFileStub },
				"path": path
			});

		/**
		 * @param {SinonStub} stub
		 * @param {*} expected
		 * @param {string} message
		 */
		const _assert = ( stub, expected, message ) => {
			expected === null
				? assert.notOk( stub.called, message )
				: assert.propEqual( stub.args.map( args => args[0] ), expected, message );
			stub.resetHistory();
		};
		this.assertStdOut = ( expected, message ) => _assert( this.stdOutStub, expected, message );
		this.assertStdErr = ( expected, message ) => _assert( this.stdErrStub, expected, message );
	});

	hooks.afterEach( /** @this {TestContextUtilsLogger} */ function() {
		this.fakeTimer.restore();
	});


	test( "Log levels", /** @this {TestContextUtilsLogger} */ function( assert ) {
		let Logger;

		Logger = this.subject();
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			true,
			"Listens to error messages by default"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			false,
			"Doesn't listen to debug messages by default"
		);

		Logger = this.subject( "", false, true );
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			true,
			"Listens to error messages when in debug mode"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			true,
			"Listens to debug messages when in debug mode"
		);

		Logger = this.subject( "none" );
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			false,
			"Doesn't listen to error messages when log level is none"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			false,
			"Doesn't listen to debug messages when log level is none"
		);

		Logger = this.subject( "error" );
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			true,
			"Listens to error messages when log level is error"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			false,
			"Doesn't listen to debug messages when log level is error"
		);

		Logger = this.subject( "debug" );
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			true,
			"Listens to error messages when log level is debug"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			true,
			"Listens to debug messages when log level is debug"
		);

		Logger = this.subject( "foo" );
		assert.strictEqual(
			Logger.LISTEN_TO_ERROR,
			true,
			"Listens to error messages when log level is invalid"
		);
		assert.strictEqual(
			Logger.LISTEN_TO_DEBUG,
			false,
			"Doesn't listen to debug messages when log level is invalid"
		);
	});

	test( "Debug level logging", /** @this {TestContextUtilsLogger} */ async function() {
		const LoggerDebug = this.subject( "debug" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_NONE, "foo", "bar" );
		this.assertStdOut( null, "Doesn't log anything to stdout on loglevel 'none'" );
		this.assertStdErr( null, "Doesn't log anything to stderr on loglevel 'none'" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "" );
		this.assertStdOut( null, "Doesn't log anything to stdout without a message" );
		this.assertStdErr( null, "Doesn't log anything to stderr without a message" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar" );
		this.assertStdOut( [ "[debug][foo]\nbar\n" ], "Logs the message to stdout" );
		this.assertStdErr( null, "Doesn't log the message to stderr" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", "bar" );
		this.assertStdOut( null, "Doesn't log the error to stdout" );
		this.assertStdErr( [ "[error][foo]\nbar\n" ], "Logs the error to stderr" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", new Error( "bar" ) );
		this.assertStdOut( null, "Doesn't log the error to stdout" );
		this.assertStdErr( [ "[error][foo]\nError: bar\n" ], "Logs the error to stderr" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar", "baz" );
		this.assertStdOut( [ "[debug][foo]\nbar\n\"baz\"\n" ], "Logs debug data" );
		this.assertStdErr( null, "Doesn't log the message to stderr" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", "bar", "baz" );
		this.assertStdOut( null, "Doesn't log the error to stdout" );
		this.assertStdErr( [ "[error][foo]\nbar\n\"baz\"\n" ], "Logs debug data" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar", () => "baz" );
		this.assertStdOut( [ "[debug][foo]\nbar\n\"baz\"\n" ], "Logs debug data functions" );
		this.assertStdErr( null, "Doesn't log the message to stderr" );

		await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", "bar", () => "baz" );
		this.assertStdOut( null, "Doesn't log the error to stdout" );
		this.assertStdErr( [ "[error][foo]\nbar\n\"baz\"\n" ], "Logs debug data" );
	});

	test( "Error level logging", /** @this {TestContextUtilsLogger} */ async function() {
		const LoggerError = this.subject( "error" );

		await LoggerError.log( LoggerError.LOG_LEVEL_DEBUG, "foo", "bar", "baz" );
		this.assertStdOut( [ "[debug][foo]\nbar\n" ], "Doesn't log debug data" );
		this.assertStdErr( null, "Doesn't log the message to stderr" );

		await LoggerError.log( LoggerError.LOG_LEVEL_ERROR, "foo", "bar", "baz" );
		this.assertStdOut( null, "Doesn't log the error to stdout" );
		this.assertStdErr( [ "[error][foo]\nbar\n" ], "Doesn't log debug data" );
	});

	test( "Logging to file", /** @this {TestContextUtilsLogger} */ async function( assert ) {
		let Logger;

		// mkdirp fails
		this.mkdirpStub.rejects();
		Logger = this.subject( "debug", true );
		await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
		assert.notOk(
			this.clearfolderStub.called,
			"Doesn't call clearfolder when folder doesn't exist"
		);
		assert.notOk(
			this.appendFileStub.called,
			"Doesn't call appendFile when folder doesn't exist"
		);
		this.mkdirpStub.reset();

		// clearfolder fails
		this.clearfolderStub.rejects();
		Logger = this.subject( "debug", true );
		await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
		assert.ok(
			this.mkdirpStub.calledOnceWithExactly( "/logs" ),
			"Creates log dir once"
		);
		assert.ok(
			this.clearfolderStub.calledOnceWithExactly( "/logs", 24 * 3600 * 1000 ),
			"Calls clearfolder once"
		);
		assert.notOk(
			this.appendFileStub.called,
			"Doesn't call appendFile when folder couldn't be cleared"
		);
		this.mkdirpStub.resetHistory();
		this.clearfolderStub.reset();

		// append log output to file
		Logger = this.subject( "debug", true );
		await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
		this.fakeTimer.tick( 1337 );
		await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "baz" );
		assert.ok(
			this.mkdirpStub.calledOnceWithExactly( "/logs" ),
			"Creates log dir once"
		);
		assert.ok(
			this.clearfolderStub.calledOnceWithExactly( "/logs", 24 * 3600 * 1000 ),
			"Calls clearfolder once"
		);
		assert.propEqual(
			this.appendFileStub.args,
			[
				[ "/logs/file.log", "[1970-01-01T00:00:00.000Z][debug][foo]\nbar\n\n" ],
				[ "/logs/file.log", "[1970-01-01T00:00:01.337Z][debug][foo]\nbaz\n\n" ]
			],
			"Appends the log outputs to the log file"
		);

		// resolves, even if file can't be written
		Logger = this.subject( "debug", true );
		this.appendFileStub.rejects();
		await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
	});

	test( "Logger class", /** @this {TestContextUtilsLogger} */ async function( assert ) {
		const data = { foo: 123 };
		const error = new Error( "bar" );

		// noinspection JSValidateTypes
		const LoggerDebug = new ( this.subject( "debug" )[ "default" ] )( "foo" );

		await LoggerDebug.logError( error, "baz" );
		this.assertStdOut( null, "Doesn't log LoggerDebug.logError to stdout" );
		this.assertStdErr( [ "[error][foo]\nError: bar\n\"baz\"\n" ], "LoggerDebug.logError" );

		await LoggerDebug.logDebug( "bar", "baz" );
		this.assertStdOut( [ "[debug][foo]\nbar\n\"baz\"\n" ], "LoggerDebug.logDebug" );
		this.assertStdErr( null, "Doesn't log LoggerDebug.logDebug to stderr" );

		await assert.rejects(
			() => Promise.reject( error ).catch( LoggerDebug.logRejected( "baz" ) ),
			error,
			"LoggerDebug.logRejected rejects with the original error"
		);
		this.assertStdOut( null, "Doesn't log LoggerDebug.logRejected to stdout" );
		this.assertStdErr(
			[ "[error][foo]\nError: bar\n\"baz\"\n" ],
			"LoggerDebug.logRejected logs to stderr"
		);

		assert.strictEqual(
			await Promise.resolve( data ).then( LoggerDebug.logResolved( "bar", "baz" ) ),
			data,
			"LoggerDebug.logResolved resolves with the original data"
		);
		this.assertStdOut(
			[ "[debug][foo]\nbar\n\"baz\"\n" ],
			"LoggerDebug.logResolved with data logs to stdout"
		);
		this.assertStdErr( null, "Doesn't log Logger.logResolved to stderr" );

		assert.strictEqual(
			await Promise.resolve( data ).then( LoggerDebug.logResolved( "bar" ) ),
			data,
			"LoggerDebug.logResolved resolves with the original data"
		);
		this.assertStdOut(
			[ "[debug][foo]\nbar\n{\n    \"foo\": 123\n}\n" ],
			"LoggerDebug.logResolved without data logs to stdout"
		);
		this.assertStdErr( null, "Doesn't log Logger.logResolved to stderr" );

		// noinspection JSValidateTypes
		const LoggerError = new ( this.subject( "error" )[ "default" ] )( "foo" );
		await LoggerError.logDebug( "bar" );
		this.assertStdOut( null, "Doesn't log debug messages when on error level" );
		this.assertStdErr( null, "Doesn't log debug messages to stderr" );
		await Promise.resolve( 123 ).then( LoggerError.logResolved( "bar" ) );
		this.assertStdOut( null, "Doesn't log debug messages when on error level" );
		this.assertStdErr( null, "Doesn't log debug messages to stderr" );

		// noinspection JSValidateTypes
		const LoggerNone = new ( this.subject( "none" )[ "default" ] )( "foo" );
		await LoggerNone.logError( "bar" );
		this.assertStdOut( null, "Doesn't log error messages to stdout" );
		this.assertStdErr( null, "Doesn't log error messages when on none level" );
		await Promise.reject( 123 ).then( LoggerNone.logRejected( "bar" ) ).catch( () => {} );
		this.assertStdOut( null, "Doesn't log error messages to stdout" );
		this.assertStdErr( null, "Doesn't log error messages when on none level" );
	});
});
