const { promises: { readFile } } = require( "fs" );


/**
 * @param {string} file
 * @param {string} version
 * @returns {Promise<string>}
 */
module.exports = async function getReleaseChangelog( file, version ) {
	const reSplit = /\n## /g;
	const reFormat = /^\[v?(\d+\.\d+\.\d+(?:-\S+)?)]\(\S+\) \(\d{4}-\d{2}-\d{2}\)\n{2}([\s\S]+)$/;

	const content = ( await readFile( file ) ).toString();
	const release = content
		.split( reSplit )
		.slice( 1 )
		.map( release => reFormat.exec( release ) )
		.filter( Boolean )
		.find( release => release[ 1 ] === version );

	if ( !release || !release[ 2 ] ) {
		throw new Error( `Changelog of version '${version}' not found.` );
	}

	return release[ 2 ].trim();
};
