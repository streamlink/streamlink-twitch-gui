import Moment from "moment";
import { log as logConfig } from "config";
import { argv, ARG_LOGFILE, ARG_LOGLEVEL } from "nwjs/argv";
import { isDebug } from "nwjs/debug";
import process from "nwjs/process";
import denodify from "utils/node/denodify";
import { tmpdir } from "utils/node/platform";
import mkdirp from "utils/node/fs/mkdirp";
import clearfolder from "utils/node/fs/clearfolder";
import { resolve as resolvePath } from "path";
import { appendFile } from "fs";


export const LOG_LEVEL_NONE = "none";
export const LOG_LEVEL_ERROR = "error";
export const LOG_LEVEL_DEBUG = "debug";

const LOG_LEVELS = [
	LOG_LEVEL_NONE,
	LOG_LEVEL_ERROR,
	LOG_LEVEL_DEBUG
];

const LOG_LEVEL_DEFAULT = isDebug
	? LOG_LEVEL_DEBUG
	: LOG_LEVEL_ERROR;


const arg = String( argv[ ARG_LOGLEVEL ] || "" ).toLowerCase();
const level = LOG_LEVELS.indexOf( arg ) === -1
	? LOG_LEVEL_DEFAULT
	: arg;
const idxLevel = LOG_LEVELS.indexOf( level );


export const LISTEN_TO_ERROR = idxLevel >= LOG_LEVELS.indexOf( LOG_LEVEL_ERROR );
export const LISTEN_TO_DEBUG = idxLevel >= LOG_LEVELS.indexOf( LOG_LEVEL_DEBUG );


const {
	dir,
	filename,
	maxAgeDays
} = logConfig;

/**
 * @type {Function}
 * @returns {Promise}
 */
const fsAppendFile = denodify( appendFile );

/**
 * @type {Function}
 * @returns {Promise}
 */
const writeStdOut = denodify( process.stdout.write.bind( process.stdout ) );

/**
 * @type {Function}
 * @returns {Promise}
 */
const writeStdErr = denodify( process.stderr.write.bind( process.stderr ) );


const logFileName = new Moment().format( filename );
let logFilePath;


function format( level, namespace, data, debug ) {
	debug = debug
		? `${JSON.stringify( debug, null, 4 )}\n`
		: "";

	return `[${level}][${namespace}]\n${data}\n${debug}`;
}

function formatFile() {
	return `[${new Date().toISOString()}]${format( ...arguments )}\n`;
}


/**
 * @param {String} level
 * @param {String} namespace
 * @param {(Object|String|Error)} data
 * @param {(*|Function)?} debug
 * @returns {Promise}
 */
export async function log( level, namespace, data, debug ) {
	if ( !data || LOG_LEVELS.indexOf( level ) < 1 ) {
		return Promise.resolve();
	}

	if ( debug ) {
		debug = LISTEN_TO_DEBUG
			? debug instanceof Function
				? debug()
				: debug
			: null;
	}

	const logMethod = level === LOG_LEVEL_ERROR
		? writeStdErr
		: writeStdOut;

	try {
		await logMethod( format( level, namespace, data, debug ) );
	} catch ( e ) {}

	if ( argv[ ARG_LOGFILE ] ) {
		try {
			if ( !logFilePath ) {
				const logDir = tmpdir( dir );
				await mkdirp( logDir );
				await clearfolder( logDir, maxAgeDays * 24 * 3600 * 1000 );

				logFilePath = resolvePath( logDir, logFileName );
			}
			await fsAppendFile( logFilePath, formatFile( level, namespace, data, debug ) );
		} catch ( e ) {}
	}
}


export default class Logger {
	/**
	 * @param {String} namespace
	 */
	constructor( namespace ) {
		this.namespace = namespace;

		const prototype = Logger.prototype;
		Object.getOwnPropertyNames( prototype )
			.filter( name => name !== "constructor" )
			.forEach( method => this[ method ] = prototype[ method ].bind( this ) );
	}

	/**
	 * @param {(String|Error)} error
	 * @param {(*|Function)?} debug
	 * @returns {Promise}
	 */
	logError( error, debug ) {
		return LISTEN_TO_ERROR
			? log( LOG_LEVEL_ERROR, this.namespace, error, debug )
			: Promise.resolve();
	}

	/**
	 * @param {(Object|String)} message
	 * @param {(*|Function)?} debug
	 * @returns {Promise}
	 */
	logDebug( message, debug ) {
		return LISTEN_TO_DEBUG
			? log( LOG_LEVEL_DEBUG, this.namespace, message, debug )
			: Promise.resolve();
	}

	/**
	 * @param {(*|Function)?} debug
	 * @returns {function(*): (Promise)}
	 */
	logRejected( debug ) {
		return async err => {
			await this.logError( err, debug );
			return Promise.reject( err );
		};
	}

	/**
	 * @param {(Object|String)} message
	 * @param {(*|Function)?} debug
	 * @returns {function(*): (Promise)}
	 */
	logResolved( message, debug ) {
		return async data => {
			await this.logDebug( message, debug !== undefined ? debug : data );
			return Promise.resolve( data );
		};
	}
}
