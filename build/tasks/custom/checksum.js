const platforms = require( "../common/platforms" );
const config = require( "../configs/dist" );
const { createHash } = require( "crypto" );
const { createReadStream, writeFile } = require( "fs" );
const { resolve: r, basename, relative } = require( "path" );


function checkTarget( target ) {
	return config.hasOwnProperty( target )
	    && config[ target ].hasOwnProperty( "checksum" );
}


module.exports = function( grunt ) {
	const name = "checksum";
	const descr = `Create a list of checksums. ${platforms.getList()}`;

	grunt.registerTask( name, descr, function() {
		const done = this.async();
		const options = this.options();

		/** @type {string[]} target */
		const targets = this.args;

		// targets need to be set explicitly
		if ( !targets.every( checkTarget ) ) {
			grunt.fail.fatal( "Invalid dist task parameters" );
		}

		const promises = targets
			.map( target => grunt.config.process( config[ target ].checksum ) )
			.sort()
			.map( file => new Promise( ( resolve, reject ) => {
				const hash = createHash( options.algorithm );
				hash.setEncoding( options.encoding );

				const stream = createReadStream( file );
				stream.on( "error", reject );
				stream.on( "end", () => {
					hash.end();
					resolve({
						file: basename( file ),
						hash: hash.read()
					});
				});
				stream.pipe( hash );
			}) );

		Promise.all( promises )
			.then( list => list
				.map( item => `${item.hash}  ${item.file}` )
				.join( "\n" )
			)
			.then( checksums => new Promise(function( resolve, reject ) {
				const path = r( options.dest );
				writeFile( path, `${checksums}\n`, err => {
					if ( err ) {
						reject( err );
					} else {
						const dest = relative( ".", path );
						grunt.log.ok( `Checksums written to ${dest}` );
						grunt.log.writeln( checksums );
						resolve();
					}
				});
			}) )
			.then( done, grunt.fail.fatal );
	});
};
