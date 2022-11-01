import minimist from "minimist";
import { argv as appArgv, filteredArgv, manifest, dataPath } from "nwjs/App";
import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";
import { dirname } from "path";


export const ARG_TRAY = "tray";
export const ARG_MAX = "max";
export const ARG_MIN = "min";
export const ARG_RESET_WINDOW = "reset-window";
export const ARG_VERSIONCHECK = "versioncheck";
export const ARG_LOGLEVEL = "loglevel";
export const ARG_LOGFILE = "logfile";
export const ARG_THEME = "theme";
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
		ARG_THEME,
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
		[ ARG_THEME ]: "",
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
	/^--no-zygote/,
	/^--flag-switches-(begin|end)/
];

/** @type {Function[]} */
const argTests = [
	...minimistOptions.boolean,
	...minimistOptions.string,
	...Object.keys( minimistOptions.alias ).reduce( ( arr, key ) => {
		arr.push( ...minimistOptions.alias[ key ] );
		return arr;
	}, [] )
].map( name => name.length === 1
	// shorthand parameters
	? ( arg => arg.length > 1 && arg.slice( 1 ) === name )
	// named parameters
	: ( arg => arg.length > 2 && arg[1] === "-" && arg.slice( 2 ) === name )
);


/**
 * Turns a command line string into a parameter object
 *
 * NW.js doesn't correctly parse the passed command line from second application starts
 * and the positions of parameters and their values will get shifted partially. There is nothing
 * which can be done on the application code side to restore the original parameter order.
 *
 * Examples:
 * - When executing `/path/to/executable --launch foo`:
 *   /path/to/executable --launch --chromium --specific --stuff foo
 * - When executing `/path/to/executable --launch foo --goto bar --minimize`:
 *   /path/to/executable --launch --goto --minimize --chromium --specific --stuff foo bar
 *
 * The Chromium specific parameters are a mix of the custom NW.js chromium-args field and internal
 * Chromium parameters. Those have to be removed in order to be able to at least restore
 * single-parameter-and-value usage. Since internal Chromium parameters are unpredictable/unknown,
 * we're simply removing any parameter with a leading dash that is not defined in the list above.
 *
 * @param {String} command
 * @returns {Object}
 */
export function parseCommand( command ) {
	// remove chromium args from the command line
	/* istanbul ignore else */
	if ( manifest && hasOwnProperty.call( manifest, "chromium-args" ) ) {
		const chromiumArgs = manifest[ "chromium-args" ];
		const pos = command.indexOf( chromiumArgs );
		/* istanbul ignore else */
		if ( pos !== -1 ) {
			command = command.slice( 0, pos ) + command.slice( pos + chromiumArgs.length );
		}
	}
	// Remove user data dir parameter from the command line.
	// This is terribly broken on macOS, as NW.js doesn't use quotation marks for paths including
	// a space character here, which means that the string can't be parsed.
	const userDataDir = dirname( dataPath );
	command = command
		.replace( `--user-data-dir=${userDataDir}`, "" )
		.replace( `--user-data-dir="${userDataDir}"`, "" );

	const argv = getParameters( { command }, parameters )
		.slice( 1 )
		// remove known Chromium parameters
		.filter( arg => !argFilters.some( regex => regex.test( arg ) ) )
		// workaround (for now): only accept known application parameters
		.filter( arg => arg[0] !== "-" || argTests.some( test => test( arg ) ) );

	return minimist( argv, minimistOptions );
}


export const argv = minimist( appArgv, minimistOptions );
