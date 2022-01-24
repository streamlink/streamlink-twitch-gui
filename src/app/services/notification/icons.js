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

/** @type {Map<string, string>} */
const userIconCache = new Map();


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
 * @param {TwitchUser} user
 * @returns {Promise<string>}
 */
export async function iconDownload( user ) {
	// don't download logo again if it has already been downloaded
	const { id, profile_image_url } = user;

	let file = userIconCache.get( id );
	if ( !file ) {
		file = await download( profile_image_url, iconCacheDir );
		userIconCache.set( id, file );
	}

	return file;
}
