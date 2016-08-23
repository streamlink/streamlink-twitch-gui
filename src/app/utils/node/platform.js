import { dirs } from "config";
import { sort } from "utils/semver";
import OS from "os";
import PATH from "path";


export const platform = OS.platform();
export const release  = OS.release();


function isVersionGte( version ) {
	return sort([ release, version ]).shift() === version;
}


export const isWin    = platform === "win32";
export const isDarwin = platform === "darwin";
export const isLinux  = platform === "linux";

export const isWinGte8 = isWin && isVersionGte( "6.2.0" );


const slice = [].slice;
const { temp: tmpdirName } = dirs;
const tmpdirRoot = [ OS.tmpdir(), tmpdirName ];


export function tmpdir() {
	let args = slice.call( arguments );
	return PATH.resolve.apply( PATH, tmpdirRoot.concat( args ) );
}
