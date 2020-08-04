module.exports = function( grunt ) {
	const hash = require( "../common/hash" );
	const { options: distOptions } = require( "../configs/dist" );
	const { writeFile: fsWriteFile } = require( "fs" );
	const { resolve: r, basename } = require( "path" );
	const { promisify } = require( "util" );

	const writeFile = promisify( fsWriteFile );
	const { hasOwnProperty } = {};

	function taskChecksum() {
		const done = this.async();
		const { algorithm, encoding, dest } = this.options();
		const targets = this.args;
		const checksumFile = r( dest );

		const promises = targets
			.map( target => {
				if (
					   !hasOwnProperty.call( distOptions, target )
					|| !hasOwnProperty.call( distOptions[ target ], "checksum" )
				) {
					grunt.fail.fatal( `Invalid dist task parameter: ${target}` );
				}

				return grunt.config.process( distOptions[ target ].checksum );
			})
			.sort()
			.map( file => hash( file, algorithm, encoding )
				.then( hash => ({
					file: basename( file ),
					hash
				}) )
			);

		Promise.all( promises )
			.then( list => list
				.map( item => `${item.hash}  ${item.file}` )
				.join( "\n" )
			)
			.then( async checksums => {
				await writeFile( checksumFile, `${checksums}\n` );
				grunt.log.ok( `Checksums written to ${checksumFile}` );
				grunt.log.writeln( checksums );
			})
			.then( done, grunt.fail.fatal );
	}

	grunt.registerTask(
		"checksum",
		"Create a list of checksums.",
		taskChecksum
	);
};
