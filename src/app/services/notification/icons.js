import { get, set } from "@ember/object";
import { files as filesConfig, notification as notificationConfig } from "config";
import { cachedir } from "utils/node/platform";
import mkdirp from "utils/node/fs/mkdirp";
import clearfolder from "utils/node/fs/clearfolder";
import download from "utils/node/fs/download";
import { resolve, join } from "path";


const { icons: { big: bigIcon } } = filesConfig;
const {
	cache: {
		dir: cacheName,
		time: cacheTime
	}
} = notificationConfig;
const iconCacheDir = join( cachedir, cacheName );


// TODO: implement an icon resolver for Linux icon themes
export const iconGroup = resolve( bigIcon );

/**
 * @returns {Promise}
 */
export async function iconDirCreate() {
	await mkdirp( iconCacheDir );
}

/**
 * @returns {Promise}
 */
export async function iconDirClear() {
	try {
		await clearfolder( iconCacheDir, cacheTime );
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
	const file = await download( logo, iconCacheDir );

	// set the local channel logo on the twitchStream record
	set( stream, "logo", file );
}
