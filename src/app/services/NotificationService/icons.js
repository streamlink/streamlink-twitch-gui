import { get, set } from "@ember/object";
import { files as filesConfig, notification as notificationConfig } from "config";
import { isWin, tmpdir } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import mkdirp from "utils/node/fs/mkdirp";
import clearfolder from "utils/node/fs/clearfolder";
import download from "utils/node/fs/download";


const { icons: { big: bigIcon } } = filesConfig;
const {
	cache: {
		dir: cacheDir,
		time: cacheTime
	}
} = notificationConfig;
const cacheTmpDir = tmpdir( cacheDir );


export const iconGroup = isWin
	? resolvePath( "%NWJSAPPPATH%", bigIcon )
	: resolvePath( bigIcon );

/**
 * @returns {Promise}
 */
export async function iconDirCreate() {
	await mkdirp( cacheTmpDir );
}

/**
 * @returns {Promise}
 */
export async function iconDirClear() {
	try {
		await clearfolder( cacheTmpDir, cacheTime );
	} catch ( e ) {}
}

/**
 * @param {TwitchStream} stream
 * @returns {Promise}
 */
export async function iconDownload( stream ) {
	// don't download logo again if it has already been downloaded
	if ( get( stream, "logo" ) ) {
		return;
	}

	const logo = get( stream, "channel.logo" );
	const file = await download( logo, cacheTmpDir );

	// set the local channel logo on the twitchStream record
	set( stream, "logo", file );
}
