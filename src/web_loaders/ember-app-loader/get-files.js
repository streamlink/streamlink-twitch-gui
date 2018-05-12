const { join, posix: { join: joinPosix } } = require( "path" );


module.exports = function getFiles( cachedFs, context, { dir, regex } ) {
	const getFilesRecursively = dir => {
		const files = [];
		const contextpath = join( context, dir );

		for ( const item of cachedFs.readdirSync( contextpath ) ) {
			const fullpath = join( contextpath, item );
			const importpath = joinPosix( dir, item );
			const stat = cachedFs.statSync( fullpath );

			if ( stat.isFile() ) {
				if ( regex.test( importpath ) ) {
					files.push( importpath );
				}
			} else if ( stat.isDirectory() ) {
				files.push( ...getFilesRecursively( importpath ) );
			}
		}

		return files;
	};

	return getFilesRecursively( dir );
};
