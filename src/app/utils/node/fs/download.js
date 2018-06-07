import mkdirp from "utils/node/fs/mkdirp";
import getRedirected from "utils/node/http/getRedirected";
import { basename, resolve as pathResolve } from "path";
import { WriteStream } from "fs";
import { setTimeout, clearTimeout } from "timers";
import { parse as urlParse } from "url";


/**
 * @param {Url} url
 * @param {string} path
 * @param {number?} time
 * @returns {Promise}
 */
async function downloadPromise( url, path, time ) {
	let writeStream;
	let incomingMessage;
	let timeout = null;

	try {
		writeStream = new WriteStream( path );
		incomingMessage = await getRedirected( url );

		await new Promise( ( resolve, reject ) => {
			writeStream.once( "error", reject );

			incomingMessage.once( "end", resolve );
			incomingMessage.once( "error", reject );
			incomingMessage.once( "unpipe", () => reject( new Error( "I/O error" ) ) );

			// link readStream and writeStream
			incomingMessage.pipe( writeStream, { end: true } );

			if ( time ) {
				timeout = setTimeout( () => reject( new Error( "Timeout" ) ), time );
			}
		});
	} finally {
		if ( timeout ) {
			clearTimeout( timeout );
		}
		if ( !incomingMessage.destroyed ) {
			incomingMessage.destroy();
		}
	}
}


/**
 * Download a file over http(s) and write it to the filesystem
 * @param {(string|Url)} url
 * @param {(string|Object)} dest
 * @param {string?} dest.dir
 * @param {string?} dest.name
 * @param {number?} time
 * @returns {Promise}
 */
async function download( url, dest, time ) {
	if ( typeof url === "string" ) {
		url = urlParse( url );
	}
	if ( !url || !url.protocol || !url.host || !url.pathname ) {
		throw new Error( "Invalid download URL" );
	}

	if ( typeof dest === "string" ) {
		dest = {
			dir: dest,
			name: null
		};
	}
	if ( !dest || !dest.dir ) {
		throw new Error( "Invalid directory" );
	}

	// download file path
	const name = dest.name
		|| basename( url.pathname )
		|| `${String( Math.random() ).substr( 2 )}.download`;
	const path = pathResolve( dest.dir, name );

	// try to create download directory
	await mkdirp( dest.dir );

	// download and save
	await downloadPromise( url, path, time );

	return path;
}


export default download;
