import {
	stat,
	isDirectory
} from "utils/node/fs/stat";
import mkdirp from "utils/node/fs/mkdirp";
import getRedirected from "utils/node/http/getRedirected";
import {
	basename,
	resolve as pathResolve
} from "path";
import { WriteStream } from "fs";
import { parse as urlParse } from "url";


/**
 * @param {Url} url
 * @param {(Writable|EventEmitter)} writeStream
 * @returns {Promise}
 */
function downloadPromise( url, writeStream ) {
	return getRedirected( url )
		.then( incomingMessage =>
			new Promise( ( resolve, reject ) => {
				writeStream.once( "error", reject );

				incomingMessage.once( "end", resolve );
				incomingMessage.once( "error", reject );
				incomingMessage.once( "unpipe", () => reject( new Error( "I/O error" ) ) );

				// link readStream and writeStream
				incomingMessage.pipe( writeStream, { end: true } );
			})
				.finally( () => {
					incomingMessage.destroy();
					writeStream.end();
				})
		);
}


/**
 * Download a file over http(s) and write it to the filesystem
 * @param {(String|Url)} url
 * @param {(String|Object)} dest
 * @param {String?} dest.directory
 * @param {String?} dest.name
 * @returns {Promise}
 */
function download( url, dest ) {
	if ( typeof url === "string" ) {
		url = urlParse( url );
	}
	if ( !url.protocol || !url.host ) {
		return Promise.reject( new Error( "Invalid download URL" ) );
	}

	if ( typeof dest === "string" ) {
		dest = {
			dir : dest,
			name: null
		};
	}
	if ( !dest || !dest.dir || typeof dest.dir !== "string" ) {
		return Promise.reject( new Error( "Invalid directory" ) );
	}

	// does the path exist?
	return stat( dest.dir, isDirectory )
		// if not, try to create it
		.catch( () => mkdirp( dest.dir ) )
		// download and save
		.then( () => {
			let name   = dest.name || basename( url.pathname ) || "download";
			let path   = pathResolve( dest.dir, name );
			let stream = new WriteStream( path );

			return downloadPromise( url, stream )
				.then( () => path );
		});
}


export default download;
