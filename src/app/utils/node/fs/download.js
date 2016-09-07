import {
	stat,
	isDirectory
} from "utils/node/fs/stat";
import mkdirp from "utils/node/fs/mkdirp";
import PATH from "path";
import FS from "fs";
import HTTP from "http";
import HTTPS from "https";


const reScheme = /^(?:http(s)?):\/\/(?:.*\/)+([^\/]+)?$/i;


/**
 * Download a file via HTTP/HTTPS and save it to the filesystem
 * @param {String} url
 * @param {String} dir
 * @param {String?} name
 * @returns {Promise}
 */
function download( url, dir, name ) {
	let match = reScheme.exec( url );
	if ( !dir || !match || !match[2] ) { return Promise.reject(); }

	// if name is not set, use the remote path as file name
	let dest = PATH.join( dir, name || match[2] || "download" );

	// check if the file already exists
	return stat( dest )
		// file does not exist
		.catch(function() {
			// check if the directory exists
			return stat( dir, isDirectory )
				// try to create directory
				.catch( mkdirp.bind( null, dir ) )
				// now start the download
				.then(function() {
					return new Promise(function ( resolve, reject ) {
						let write = FS.createWriteStream( dest );

						write.on( "error", function() {
							write.close( reject );
						});
						write.on( "finish", function() {
							write.close( resolve.bind( null, dest ) );
						});

						// start the download via https or http depending on the url scheme
						( match[1] ? HTTPS : HTTP ).get( url, function( response ) {
							response.pipe( write );
						}).on( "error", reject );
					});
				});
		});
}


export default download;
