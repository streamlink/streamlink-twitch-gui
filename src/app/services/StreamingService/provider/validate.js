import {
	streamprovider as streamproviderConfig
} from "config";
import {
	LogError,
	ProviderError,
	VersionError
} from "../errors";
import spawn from "../spawn";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


const { hasOwnProperty } = {};
const {
	"version-min": versionMin,
	"validation-timeout": validationTimeout
} = streamproviderConfig;

const reVersion = /^(streamlink|livestreamer)(?:\.exe|-script\.pyw?)? (\d+\.\d+\.\d+)(?:$|\s.*)/i;
const params = [ "--version", "--no-version-check" ];


/**
 * Validate
 * Runs the executable with the `--version` parameter and reads answer from stderr
 * @param {ExecObj} execObj
 * @returns {Promise}
 */
export default async function( execObj ) {
	let child;

	const { name, version } = await new Promise( ( resolve, reject ) => {
		child = spawn( execObj, params );

		const onLine = ( line, index, lines ) => {
			// be strict: output is just one single line
			if ( index !== 0 || lines.length !== 1 ) {
				reject( new LogError( "Unexpected version check output", lines ) );
				return;
			}

			// match the version string
			const match = reVersion.exec( line );
			if ( match ) {
				let [ , name, version ] = match;
				name = name.toLowerCase();
				resolve({ name, version });
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
			if ( child ) {
				child.kill( "SIGKILL" );
				child = null;
			}
		});

	if ( !hasOwnProperty.call( versionMin, name ) ) {
		throw new ProviderError();
	}

	if ( version !== getMax([ version, versionMin[ name ] ]) ) {
		throw new VersionError( version );
	}

	return { name, version };
}
