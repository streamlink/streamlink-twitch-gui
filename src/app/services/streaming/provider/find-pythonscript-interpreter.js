import ExecObj from "../exec-obj";
import readLines from "utils/node/fs/readLines";
import whichFallback from "utils/node/fs/whichFallback";
import { isWin } from "utils/node/platform";
import { basename, dirname } from "path";


const reShebangEnv = /^#!\/usr\/bin\/env\s+(['"]?)(\S+)\1$/;
const reShebangExpl = /^#!(['"]?)(.+)\1$/;
const reBashWrapperScript = /^(PYTHONPATH)="(.+)"\s+exec\s+"(.+)"\s+"\$@"\s*$/;


/**
 * Get interpreter of the streaming provider's python script.
 * @param {String} file Python script path
 * @param {Object} providerConfData Provider config data
 * @param {String} providerUserDataExec Custom provider exec path
 * @param {Boolean?} noRecursion
 * @returns {Promise.<ExecObj>}
 */
export default async function findPythonscriptInterpreter(
	file,
	providerConfData,
	providerUserDataExec,
	noRecursion
) {
	let isBashWrapperScript = false;
	function validate( line, index ) {
		if ( index === 0 ) {
			const matchEnv = reShebangEnv.exec( line );
			const matchExpl = reShebangExpl.exec( line );
			const shebang = ( matchEnv && matchEnv[2] || matchExpl && matchExpl[2] || "" ).trim();
			if ( shebang ) {
				if ( !shebang.endsWith( "bash" ) ) {
					return shebang;
				} else {
					isBashWrapperScript = true;
				}
			}

		} else if ( index === 1 && isBashWrapperScript ) {
			const match = reBashWrapperScript.exec( line );
			if ( match ) {
				return match;
			}
		}
	}

	const [ [ shebang, wrapperData ] ] = await readLines( file, validate, 2 )
		// don't reject: return empty array instead
		.catch( () => ([ [] ]) );

	// the python script is a bash wrapper script
	if ( isBashWrapperScript && wrapperData && !noRecursion ) {
		const [ , envVarName, pythonPaths, pythonscript ] = wrapperData;
		const env = { [ envVarName ]: pythonPaths };
		// now parse the real python script
		const { exec } = await findPythonscriptInterpreter(
			pythonscript,
			providerConfData,
			providerUserDataExec,
			true
		);

		return new ExecObj( exec, [ pythonscript ], env );

	} else if ( shebang ) {
		let exec;

		if ( !isWin ) {
			exec = await whichFallback( shebang, providerConfData[ "fallback" ], null, false );

		} else {
			try {
				// don't use the shebang directly: Windows requires a different python executable
				const pythonPath = dirname( shebang );
				// look up the default Windows executable in the shebang's dir
				exec = await whichFallback( providerConfData[ "exec" ], pythonPath, null, true );

			} catch ( e ) {
				// python executable could not be found:
				// try to regularly look up the executable name now
				const name = basename( shebang );
				exec = await whichFallback( name, providerConfData[ "fallback" ], null, false );
			}
		}

		return new ExecObj( exec );

	} else if ( providerUserDataExec ) {
		// malformed python script, but custom provider exec
		return new ExecObj();
	}

	throw new Error( "Invalid python script" );
}
