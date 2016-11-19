import { dirs } from "config";
import { sort } from "utils/semver";
import OS from "os";
import PATH from "path";


const { resolve } = PATH;


export const platform = OS.platform();
export const release  = OS.release();


function isVersionGte( version ) {
	return sort([ release, version ]).shift() === version;
}


export const isWin    = platform === "win32";
export const isDarwin = platform === "darwin";
export const isLinux  = platform === "linux";

export const isWinGte8 = isWin && isVersionGte( "6.2.0" );
export const isMountainLion = isDarwin && isVersionGte( "12.0.0" );


const { temp: tmpdirName } = dirs;
const tmpdirRoot = [ OS.tmpdir(), tmpdirName ];


export function tmpdir() {
	return resolve( ...tmpdirRoot, ...arguments );
}
