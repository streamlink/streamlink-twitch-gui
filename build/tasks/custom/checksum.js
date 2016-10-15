var CRYPTO = require( "crypto" );
var FS = require( "fs" );
var PATH = require( "path" );
var platforms = require( "../common/platforms" );
var config = require( "../configs/dist" );


module.exports = function( grunt ) {
	var name  = "checksum";
	var descr = "Create a list of checksums. " + platforms.getList();

	grunt.registerTask( name, descr, function() {
		var done = this.async();
		var options = this.options();

		/** @type {string[]} target */
		var targets = this.args;

		// targets need to be set explicitly
		if ( !targets.every( config.hasOwnProperty.bind( config ) ) ) {
			grunt.fail.fatal( "Invalid dist task parameters" );
		}

		var promises = targets
			.map(function( target ) {
				return grunt.config.process( config[ target ].file );
			})
			.sort()
			.map(function( file ) {
				return new Promise(function( resolve, reject ) {
					var hash = CRYPTO.createHash( options.algorithm );
					hash.setEncoding( options.encoding );

					var stream = FS.createReadStream( file );
					stream.on( "error", reject );
					stream.on( "end", function() {
						hash.end();
						resolve({
							file: PATH.basename( file ),
							hash: hash.read()
						});
					});
					stream.pipe( hash );
				});
			});

		Promise.all( promises )
			.then(function( list ) {
				return list
					.map(function( item ) {
						return item.hash + "  " + item.file;
					})
					.join( "\n" );
			})
			.then(function( checksums ) {
				return new Promise(function( resolve, reject ) {
					var path = PATH.resolve( options.dest );
					FS.writeFile( path, checksums + "\n", function( err ) {
						if ( err ) {
							reject( err );
						} else {
							grunt.log.ok( "Checksums written to " + PATH.relative( ".", path ) );
							resolve();
						}
					});
				});
			})
			.then( done, grunt.fail.fatal );
	});
};
