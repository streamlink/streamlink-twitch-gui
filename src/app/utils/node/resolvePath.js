import { isWin } from "utils/node/platform";
import { resolve } from "path";


const reVarWindows = /%([^%]+)%/g;
const reVarUnix    = /\$([A-Z_]+)/g;


function fnVarReplace( _, v ) {
	return process.env[ v ] || "";
}

function resolvePathFactory( pattern ) {
	return function resolvePath() {
		let args = [ ...arguments ];
		if ( args[ 0 ] ) {
			args[ 0 ] = args[ 0 ].replace( pattern, fnVarReplace );
		}

		return resolve( ...args );
	};
}


export default isWin
	? resolvePathFactory( reVarWindows )
	: resolvePathFactory( reVarUnix );
