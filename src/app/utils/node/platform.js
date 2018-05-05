import semver from "semver";
import { main as mainConfig } from "config";
import {
	arch as osArch,
	homedir as osHomedir,
	platform as osPlatform,
	release as osRelease,
	tmpdir as osTmpdir
} from "os";
import { join, resolve } from "path";


const { "app-identifier": appIdentifier } = mainConfig;
const { env } = process;
const home = osHomedir();


export const platform = osPlatform();
export const release  = osRelease();
export const arch     = osArch();


export const isWin    = platform === "win32";
export const isDarwin = platform === "darwin";
export const isLinux  = platform === "linux";

export const isWin7    = isWin && semver.lt( release, "6.2.0" );
export const isWinGte8 = isWin && !isWin7;

export const is64bit = arch === "x64";


export const cachedir = ( () => {
	if ( isLinux ) {
		return resolve( env.XDG_CACHE_HOME || join( home, ".cache" ), appIdentifier );
	} else if ( isDarwin ) {
		return resolve( home, "Library", "Caches", appIdentifier );
	} else {
		return resolve( osTmpdir(), appIdentifier, "cache" );
	}
})();


export const datadir = ( () => {
	if ( isLinux ) {
		return resolve(
			env.XDG_DATA_HOME || join( home, ".local", "share" ),
			appIdentifier,
			"data"
		);
	} else if ( isDarwin ) {
		return resolve( home, "Library", appIdentifier );
	} else {
		return resolve( osTmpdir(), appIdentifier, "data" );
	}
})();


export const logdir = ( () => {
	if ( isLinux ) {
		return resolve(
			env.XDG_DATA_HOME || join( home, ".local", "share" ),
			appIdentifier,
			"logs"
		);
	} else if ( isDarwin ) {
		return resolve( home, "Library", "Logs", appIdentifier );
	} else {
		return resolve( osTmpdir(), appIdentifier, "logs" );
	}
})();
