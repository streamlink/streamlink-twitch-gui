import minimist from "minimist";
import { argv as appArgv, filteredArgv, manifest } from "nwjs/App";
import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";


export const ARG_TRAY = "tray";
export const ARG_MAX = "max";
export const ARG_MIN = "min";
export const ARG_RESET_WINDOW = "reset-window";
export const ARG_VERSIONCHECK = "versioncheck";
export const ARG_LOGLEVEL = "loglevel";
export const ARG_LOGFILE = "logfile";
export const ARG_LAUNCH = "launch";
export const ARG_GOTO = "goto";


const minimistOptions = {
	boolean: [
		ARG_TRAY,
		ARG_MAX,
		ARG_MIN,
		ARG_RESET_WINDOW,
		ARG_VERSIONCHECK,
		ARG_LOGFILE
	],
	string: [
		ARG_LOGLEVEL,
		ARG_LAUNCH,
		ARG_GOTO
	],
	alias: {
		[ ARG_TRAY ]: [ "hide", "hidden" ],
		[ ARG_MAX ]: [ "maximize", "maximized" ],
		[ ARG_MIN ]: [ "minimize", "minimized" ],
		[ ARG_VERSIONCHECK ]: [ "version-check" ],
		[ ARG_LOGLEVEL ]: [ "l" ]
	},
	default: {
		[ ARG_VERSIONCHECK ]: true,
		[ ARG_LOGLEVEL ]: "",
		[ ARG_LOGFILE ]: true,
		[ ARG_LAUNCH ]: "",
		[ ARG_GOTO ]: ""
	}
};


const { hasOwnProperty } = {};

const { getParameters } = Parameter;

/** @type {Parameter[]} */
const parameters = [ new ParameterCustom( null, "command" ) ];

/** @type {RegExp[]} */
const argFilters = [
	...( filteredArgv || [] ),
	/^--user-data-dir=/,
	/^--no-sandbox/,
	/^--flag-switches-(begin|end)/
];


/**
 * Turns a command line string into a parameter object
 * @param {String} command
 * @returns {Object}
 */
export function parseCommand( command ) {
	// remove chromium args from the command line
	if ( manifest && hasOwnProperty.call( manifest, "chromium-args" ) ) {
		const chromiumArgs = manifest[ "chromium-args" ];
		const pos = command.indexOf( chromiumArgs );
		if ( pos !== -1 ) {
			command = command.substr( 0, pos ) + command.substr( pos + chromiumArgs.length );
		}
	}

	const argv = getParameters( { command }, parameters )
		.slice( 1 )
		.filter( arg => !argFilters.some( regex => regex.test( arg ) ) );

	return minimist( argv, minimistOptions );
}


export const argv = minimist( appArgv, minimistOptions );
