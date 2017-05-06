import ExecObj from "../exec-obj";
import readLines from "utils/node/fs/readLines";
import whichFallback from "utils/node/fs/whichFallback";
import { dirname } from "path";


const reShebangEnv = /^#!\/usr\/bin\/env\s+(['"]?)(\S+)\1\s*$/;
const reShebangExpl = /^#!(['"]?)(.+)\1\s*$/;
const reBashWrapperScript = /^(PYTHONPATH)="(.+)"\s+exec\s+"(.+)"\s+"\$@"\s*$/;


/**
 * Get interpreter of the streaming provider's python script.
 * @param {String} file
 * @param {String} providerConfigExec
 * @param {Boolean?} noRecursion
 * @returns {Promise.<ExecObj>}
 */
export default async function findPythonscriptInterpreter( file, providerConfigExec, noRecursion ) {
	let isBashWrapperScript = false;
	const validate = ( line, index ) => {
		if ( index === 0 ) {
			const matchEnv = reShebangEnv.exec( line );
			const matchExpl = reShebangExpl.exec( line );
			const shebang = matchEnv && matchEnv[2] || matchExpl && matchExpl[2];
			if ( shebang && shebang.endsWith( "bash" ) ) {
				isBashWrapperScript = true;
			} else if ( matchExpl ) {
				return matchExpl[2];
			}

		} else if ( index === 1 && isBashWrapperScript ) {
			const match = reBashWrapperScript.exec( line );
			if ( match ) {
				return match;
			}
		}
	};
	const [ [ shebang, wrapperData ] ] = await readLines( file, validate, 2 );

	// the python script is a bash wrapper script
	if ( isBashWrapperScript && wrapperData && !noRecursion ) {
		const [ , envVarName, pythonPaths, pythonscript ] = wrapperData;
		const env = { [ envVarName ]: pythonPaths };
		// now parse the real python script
		const { exec } = await findPythonscriptInterpreter(
			pythonscript,
			providerConfigExec,
			true
		);

		return new ExecObj( exec, [ pythonscript ], env );

	} else if ( shebang ) {
		// don't use the shebang directly: Windows uses a different python executable
		const pythonPath = dirname( shebang );
		// look up the custom Windows executable in the shebang's dir
		const exec = await whichFallback( providerConfigExec, pythonPath, null, true );

		return new ExecObj( exec );
	}

	throw new Error( "Couldn't validate python script of the selected streaming provider" );
}
