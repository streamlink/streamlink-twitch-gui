define([
	"utils/node/denodify",
	"utils/node/fs/stat",
	"commonjs!path",
	"commonjs!fs"
], function(
	denodify,
	stat,
	PATH,
	FS
) {

	var fsMkdir = denodify( FS.mkdir );

	function isDirectory( stat ) {
		return stat.isDirectory();
	}


	// simplified and promisified version of node-mkdirp
	// https://github.com/substack/node-mkdirp
	return function mkdirp( dir ) {
		return fsMkdir( dir )
			.catch(function( err ) {
				if ( err && err.code === "ENOENT" ) {
					// recursively try to create the parent folder
					return mkdirp( PATH.dirname( dir ) )
						// try the current folder again
						.then( fsMkdir.bind( null, dir ) );

				} else {
					// does the dir already exist?
					return stat( dir, isDirectory );
				}
			});
	};

});
