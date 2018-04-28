const { join } = require( "path" );


module.exports = function getFiles( cachedFs, context, { dir, regex } ) {
	const getFilesRecursively = dir => {
		const files = [];
		const contextpath = join( context, dir );

		for ( const item of cachedFs.readdirSync( contextpath ) ) {
			const fullpath = join( contextpath, item );
			const itempath = join( dir, item );
			const stat = cachedFs.statSync( fullpath );

			if ( stat.isFile() ) {
				if ( regex.test( itempath ) ) {
					files.push( itempath );
				}
			} else if ( stat.isDirectory() ) {
				files.push( ...getFilesRecursively( itempath ) );
			}
		}

		return files;
	};

	return getFilesRecursively( dir );
};
