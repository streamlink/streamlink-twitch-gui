import {
	streamprovider as streamproviderConfig
} from "config";
import {
	ErrorLog,
	NotFoundError,
	VersionError
} from "../errors";
import { setupCache } from "../cache";
import { logDebug } from "../logger";
import isAborted from "../is-aborted";
import spawn from "../spawn";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


const { hasOwnProperty } = {};
const {
	"version-min": versionMin,
	"validation-timeout": validationTimeout
} = streamproviderConfig;

const reVersion = /^(streamlink|livestreamer)(?:\.exe|-script\.pyw?)? (\d+\.\d+.\d+)(?:$|\s.*)/i;
const params = [ "--version", "--no-version-check" ];


/**
 * Validate
 * Runs the executable with the `--version` parameter and reads answer from stderr
 * @param {Stream} stream
 * @param {ExecObj} execObj
 * @returns {Promise}
 */
export default async function( stream, execObj ) {
	isAborted( stream );

	let child;

	const { name, version } = await new Promise( ( resolve, reject ) => {
		child = spawn( execObj, params );

		const onLine = ( line, index, lines ) => {
			// be strict: output is just one single line
			if ( index !== 0 || lines.length !== 1 ) {
				reject( new ErrorLog( "Unexpected version check output", lines ) );
				return;
			}

			// match the version string
			const match = reVersion.exec( line );
			if ( match ) {
				let [ , name, version ] = match;
				name = name.toLowerCase();
				resolve({ name, version });
			} else {
				reject( new ErrorLog( "Invalid version check output", lines ) );
			}
		};

		const onExit = code => {
			// ignore code 0 (no error)
			if ( code === 0 ) { return; }
			reject( new Error( `Exit code ${code}` ) );
		};

		const onTimeout = () => {
			reject( new Error( "Timeout" ) );
		};

		// reject on error / exit
		child.once( "error", reject );
		child.once( "exit", onExit );

		// read from stdout and stderr independently
		child.stdout.on( "data", new StreamOutputBuffer( onLine ) );
		child.stderr.on( "data", new StreamOutputBuffer( onLine ) );

		// kill after a certain time
		setTimeout( onTimeout, validationTimeout );
	})
		.finally( () => {
			if ( child ) {
				child.kill( "SIGKILL" );
				child = null;
			}
		});

	if ( !hasOwnProperty.call( versionMin, name ) ) {
		throw new NotFoundError();
	}

	if ( version !== getMax([ version, versionMin[ name ] ]) ) {
		throw new VersionError( version );
	}

	await logDebug( "Validated streaming provider", { name, version } );
	setupCache( execObj );

	return execObj;
}
