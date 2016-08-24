import denodify from "utils/node/denodify";
import stat from "utils/node/fs/stat";
import PATH from "path";
import FS from "fs";


var fsMkdir = denodify( FS.mkdir );


/**
 * simplified and promisified version of node-mkdirp
 * https://github.com/substack/node-mkdirp
 * @param {String} dir
 * @returns {Promise}
 */
function mkdirp( dir ) {
	return fsMkdir( dir )
		.catch(function( err ) {
			if ( err && err.code === "ENOENT" ) {
				// recursively try to create the parent folder
				return mkdirp( PATH.dirname( dir ) )
					// try the current folder again
					.then( fsMkdir.bind( null, dir ) );

			} else {
				// does the dir already exist?
				return stat( dir, stat.isDirectory );
			}
		});
}


export default mkdirp;
