import { isWin } from "utils/node/platform";
import PATH from "path";


const slice = [].slice;
const reVarWindows = /%([^%]+)%/g;
const reVarUnix    = /\$([A-Z_]+)/g;


function fnVarReplace( _, v ) {
	return process.env[ v ] || "";
}

function resolvePathFactory( pattern ) {
	return function resolvePath() {
		let args = slice.call( arguments );
		if ( args[ 0 ] ) {
			args[ 0 ] = args[ 0 ].replace( pattern, fnVarReplace );
		}

		return PATH.resolve.apply( null, args );
	};
}


export default isWin
	? resolvePathFactory( reVarWindows )
	: resolvePathFactory( reVarUnix );
