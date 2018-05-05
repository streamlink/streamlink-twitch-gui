import { module, test } from "qunit";
import { posix as path } from "path";

import loggerInjector from "inject-loader?-Moment&-util!utils/Logger";


const mockArgv = argv => ({
	argv: argv,
	ARG_LOGFILE: "logfile",
	ARG_LOGLEVEL: "loglevel"
});


module( "utils/Logger" );


test( "Log levels", assert => {

	let Logger;

	const commonDeps = {
		"config": { log: {} },
		"nwjs/process": global.process,
		"utils/node/platform": { logdir: "/logs" },
		"utils/node/fs/mkdirp": () => {},
		"utils/node/fs/clearfolder": () => {},
		"path": path,
		"fs": { appendFile() {} }
	};

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "",
			logfile: false
		}),
		"nwjs/debug": { isDebug: false }
	}, commonDeps ) );
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

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "",
			logfile: false
		}),
		"nwjs/debug": { isDebug: true }
	}, commonDeps ) );
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

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "none",
			logfile: false
		}),
		"nwjs/debug": { isDebug: false }
	}, commonDeps ) );
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

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "error",
			logfile: false
		}),
		"nwjs/debug": { isDebug: false }
	}, commonDeps ) );
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

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "debug",
			logfile: false
		}),
		"nwjs/debug": { isDebug: false }
	}, commonDeps ) );
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

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "foo",
			logfile: false
		}),
		"nwjs/debug": { isDebug: false }
	}, commonDeps ) );
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


test( "Logging to stdout/stderr", async assert => {

	let stdout = null;
	let stderr = null;

	const commonDeps = {
		"config": { log: {} },
		"nwjs/debug": { isDebug: false },
		"nwjs/process": {
			stdout: {
				write( message, callback ) {
					stdout = message;
					callback();
				}
			},
			stderr: {
				write( message, callback ) {
					stderr = message;
					callback();
				}
			}
		},
		"utils/node/platform": { logdir: "/logs" },
		"utils/node/fs/mkdirp": () => {},
		"utils/node/fs/clearfolder": () => {},
		"path": path,
		"fs": { appendFile() {} }
	};

	const LoggerDebug = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "debug",
			logfile: false
		})
	}, commonDeps ) );

	const LoggerError = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "error",
			logfile: false
		})
	}, commonDeps ) );

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_NONE, "foo", "bar" );
	assert.strictEqual( stdout, null, "Doesn't log anything to stdout on loglevel 'none'" );
	assert.strictEqual( stderr, null, "Doesn't log anything to stderr on loglevel 'none'" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "" );
	assert.strictEqual( stdout, null, "Doesn't log anything to stdout without a message" );
	assert.strictEqual( stderr, null, "Doesn't log anything to stderr without a message" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar" );
	assert.strictEqual( stdout, "[debug][foo]\nbar\n", "Logs the message to stdout" );
	assert.strictEqual( stderr, null, "Doesn't log the message to stderr" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", "bar" );
	assert.strictEqual( stdout, null, "Doesn't log the error to stdout" );
	assert.strictEqual( stderr, "[error][foo]\nbar\n", "Logs the error to stderr" );
	stdout = stderr = null;

	let err = new Error( "bar" );
	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", err );
	assert.strictEqual( stdout, null, "Doesn't log the error to stdout" );
	assert.strictEqual( stderr, "[error][foo]\nError: bar\n", "Logs the error to stderr" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar", "baz" );
	assert.strictEqual( stdout, "[debug][foo]\nbar\n\"baz\"\n", "Logs debug data" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_ERROR, "foo", "bar", "baz" );
	assert.strictEqual( stderr, "[error][foo]\nbar\n\"baz\"\n", "Logs debug data" );
	stdout = stderr = null;

	await LoggerDebug.log( LoggerDebug.LOG_LEVEL_DEBUG, "foo", "bar", () => "baz" );
	assert.strictEqual( stdout, "[debug][foo]\nbar\n\"baz\"\n", "Logs debug data functions" );
	stdout = stderr = null;

	await LoggerError.log( LoggerError.LOG_LEVEL_DEBUG, "foo", "bar", "baz" );
	assert.strictEqual( stdout, "[debug][foo]\nbar\n", "Doesn't log debug data" );
	stdout = stderr = null;

	await LoggerError.log( LoggerError.LOG_LEVEL_ERROR, "foo", "bar", "baz" );
	assert.strictEqual( stderr, "[error][foo]\nbar\n", "Doesn't log debug data" );
	stdout = stderr = null;

});


test( "Logging to file", async assert => {

	assert.expect( 8 );

	let Logger;

	const commonDeps = {
		"config": {
			log: {
				filename: "[file.log]",
				maxAgeDays: 1
			}
		},
		"nwjs/argv": mockArgv({
			loglevel: "debug",
			logfile: true
		}),
		"nwjs/debug": { isDebug: false },
		"nwjs/process": {
			stdout: {
				write: ( _, callback ) => { callback(); }
			},
			stderr: {
				write: ( _, callback ) => { callback(); }
			}
		},
		"utils/node/platform": {
			logdir: "/logs"
		},
		"path": path
	};

	Logger = loggerInjector( Object.assign({
		"utils/node/fs/mkdirp": dir => {
			assert.strictEqual( dir, "/logs", "Calls mkdirp" );
		},
		"utils/node/fs/clearfolder": ( dir, maxage ) => {
			assert.strictEqual( dir, "/logs", "Calls clearfolder with correct path" );
			assert.strictEqual( maxage, 24 * 3600 * 1000, "Calls clearfolder with correct maxage" );
		},
		"fs": {
			appendFile( file, content, callback ) {
				assert.strictEqual(
					file,
					"/logs/file.log",
					"Writes to the correct log file"
				);
				assert.ok(
					/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z]\[debug]\[foo]\nbar\n/m
						.test( content ),
					"Writes the correct log output"
				);
				callback();
			}
		}
	}, commonDeps ) );

	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );

	Logger = loggerInjector( Object.assign({
		"utils/node/fs/mkdirp": () => Promise.reject(),
		"utils/node/fs/clearfolder": () => {},
		"fs": {
			appendFile( file, content, callback ) {
				assert.ok( false, "Doesn't call appendFile when folder doesn't exist" );
				callback();
			}
		}
	}, commonDeps ) );

	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );

	Logger = loggerInjector( Object.assign({
		"utils/node/fs/mkdirp": () => {},
		"utils/node/fs/clearfolder": () => Promise.reject(),
		"fs": {
			appendFile( file, content, callback ) {
				assert.ok( false, "Doesn't call appendFile when folder couldn't be cleared" );
				callback();
			}
		}
	}, commonDeps ) );

	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );

	Logger = loggerInjector( Object.assign({
		"utils/node/fs/mkdirp": () => {},
		"utils/node/fs/clearfolder": () => {},
		"fs": {
			appendFile( file, content, callback ) {
				callback( true );
			}
		}
	}, commonDeps ) );

	await Logger.log( Logger.LOG_LEVEL_DEBUG, "foo", "bar" );
	assert.ok( true, "Doesn't throw errors when file can't be written" );

});


test( "Logger class", async assert => {

	let Logger;
	let error;
	let stdout = null;
	let stderr = null;

	const commonDeps = {
		"config": {
			log: {}
		},
		"nwjs/debug": { isDebug: false },
		"nwjs/process": {
			stdout: {
				write( message, callback ) {
					stdout = message;
					callback();
				}
			},
			stderr: {
				write( message, callback ) {
					stderr = message;
					callback();
				}
			}
		},
		"utils/node/platform": { logdir: "/logs" },
		"utils/node/fs/mkdirp": () => {},
		"utils/node/fs/clearfolder": () => {},
		"fs": { appendFile() {} },
		"path": path
	};

	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "debug",
			logfile: false
		})
	}, commonDeps ) )[ "default" ];

	const {
		logError,
		logDebug,
		logRejected,
		logResolved
	} = new Logger( "foo" );

	error = new Error( "bar" );
	await logError( error, "baz" );
	assert.strictEqual(
		stderr,
		"[error][foo]\nError: bar\n\"baz\"\n",
		"Logger.logError"
	);
	stdout = stderr = null;

	await logDebug( "bar", "baz" );
	assert.strictEqual(
		stdout,
		"[debug][foo]\nbar\n\"baz\"\n",
		"Logger.logDebug"
	);
	stdout = stderr = null;

	error = new Error( "bar" );
	await Promise.reject( error )
		.catch( logRejected( "baz" ) )
		.catch( err => {
			assert.strictEqual( err, error, "Logger.logRejected rejects with the original error" );
		});
	assert.strictEqual(
		stderr,
		"[error][foo]\nError: bar\n\"baz\"\n",
		"Logger.logRejected logs to stderr"
	);
	stdout = stderr = null;

	await Promise.resolve( 123 )
		.then( logResolved( "bar", "baz" ) )
		.then( data => {
			assert.strictEqual( data, 123, "Logger.logResolved resolves with the original data" );
		});
	assert.strictEqual(
		stdout,
		"[debug][foo]\nbar\n\"baz\"\n",
		"Logger.logResolved with data logs to stdout"
	);
	stdout = stderr = null;

	await Promise.resolve( 123 )
		.then( logResolved( "bar" ) )
		.then( data => {
			assert.strictEqual( data, 123, "Logger.logResolved resolves with the original data" );
		});
	assert.strictEqual(
		stdout,
		"[debug][foo]\nbar\n123\n",
		"Logger.logResolved without data logs to stdout"
	);
	stdout = stderr = null;


	Logger = loggerInjector( Object.assign({
		"nwjs/argv": mockArgv({
			loglevel: "error",
			logfile: false
		})
	}, commonDeps ) )[ "default" ];

	const {
		logDebug: logDebug2,
		logResolved: logResolved2
	} = new Logger( "foo" );

	await logDebug2( "bar" );
	assert.strictEqual( stdout, null, "Doesn't log debug messages when only listening to error" );

	await Promise.resolve( 123 )
		.then( logResolved2( "bar" ) );
	assert.strictEqual( stdout, null, "Doesn't log debug messages when only listening to error" );

});
