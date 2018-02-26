import { streaming as streamingConfig } from "config";
import { LogError, VersionError } from "../errors";
import spawn from "../spawn";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


const { hasOwnProperty: hasOP } = {};
const {
	validation: {
		timeout: validationTimeout,
		providers: validationProviders
	}
} = streamingConfig;

const params = [ "--version", "--no-version-check" ];


/**
 * Validate
 * Runs the executable with the `--version` parameter and reads answer from stderr
 * @param {ExecObj} execObj
 * @param {Object} providerConfData
 * @param {String} providerConfData.type
 * @param {String} providerConfData.flavor
 * @returns {Promise}
 */
export default async function( execObj, providerConfData ) {
	const { type, flavor } = providerConfData;
	if ( !hasOP.call( validationProviders, type ) ) {
		throw new Error( "Missing provider validation data" );
	}
	const validation = validationProviders[ type ];
	if ( !hasOP.call( validation, "version" ) || !hasOP.call( validation, "regexp" ) ) {
		throw new Error( "Invalid provider validation data" );
	}
	const regexp = new RegExp(
		typeof validation.regexp === "string"
			? validation.regexp
			: validation.regexp[ flavor ] || validation.regexp[ "default" ],
		"i"
	);


	let child;

	const version = await new Promise( ( resolve, reject ) => {
		child = spawn( execObj, params );

		const onLine = ( line, index, lines ) => {
			// be strict: output is just one single line (in a single onData stdout callback)
			if ( index !== 0 || lines.length !== 1 ) {
				reject( new LogError( "Unexpected version check output", lines ) );
				return;
			}

			// match the version string
			const match = regexp.exec( line );
			if ( match && match[ 1 ] ) {
				resolve( match[ 1 ] );
			} else {
				reject( new LogError( "Invalid version check output", lines ) );
			}
		};

		const onExit = code => {
			// ignore code 0 (no error)
			if ( code === 0 ) { return; }
			reject( new Error( `Exit code ${code}` ) );
		};

		// reject on error / exit
		child.once( "error", reject );
		child.once( "exit", onExit );

		// read from stdout and stderr independently
		child.stdout.on( "data", new StreamOutputBuffer( onLine ) );
		child.stderr.on( "data", new StreamOutputBuffer( onLine ) );

		// kill after a certain time
		setTimeout( () => reject( new Error( "Timeout" ) ), validationTimeout );
	})
		.finally( () => {
			if ( !child.killed ) {
				child.kill( "SIGKILL" );
				child = null;
			}
		});

	if ( version !== getMax([ version, validation.version ]) ) {
		throw new VersionError( version );
	}

	return { version };
}
