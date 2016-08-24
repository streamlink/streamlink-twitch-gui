import platform from "utils/node/platform";
import PATH from "path";


var reVarWindows = /%([^%]+)%/g;
var reVarUnix    = /\$([A-Z_]+)/g;

function fnVarReplace( _, v ) {
	return process.env[ v ];
}

function resolvePathWindows( path ) {
	path = path.replace( reVarWindows, fnVarReplace );
	return PATH.resolve( path );
}

function resolvePathUnix( path ) {
	path = path.replace( reVarUnix, fnVarReplace );
	return PATH.resolve( path );
}

var resolvePath = platform.isWin
	? resolvePathWindows
	: resolvePathUnix;


export default resolvePath;
