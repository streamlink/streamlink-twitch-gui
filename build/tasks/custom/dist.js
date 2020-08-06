module.exports = function( grunt ) {
	const platforms = require( "../common/platforms" );
	const { mkdir: fsMkdir } = require( "fs" );
	const { promisify } = require( "util" );

	const mkdir = promisify( fsMkdir );
	const { hasOwnProperty } = {};

	const unique = arr => Array.from( new Set( arr ) );

	function getTargets( options, args ) {
		if ( !args.length ) {
			// default target is an archive for the current platform
			return [ `archive_${platforms.getPlatform()}` ];
		}

		const arr = [];
		for ( const target of args ) {
			if ( target === "all" ) {
				arr.push( ...Object.keys( options ) );
			} else if ( hasOwnProperty.call( options, target ) ) {
				arr.push( target );
			} else {
				throw new Error( `Invalid dist target: ${target}` );
			}
		}

		return unique( arr );
	}

	function taskDist() {
		const done = this.async();
		const options = this.options();

		const [ debug, args ] = platforms.getDebugTargets( this.args );
		const targets = getTargets( options, args );

		const tasks = unique([
			// compile the application once for every given platform
			...unique( targets.map( target => options[ target ].platform ) )
				.map( platform => `compile:${platform}${debug ? ":debug" : ""}` ),
			// run all dist tasks
			...targets.map( target => options[ target ].tasks ).flat(),
			// checksum
			`checksum:${targets.join( ":" )}`
		]);

		// make sure the dist directory exists
		const distDir = grunt.config.get( "dir.dist" );
		mkdir( distDir, { recursive: true, mode: 0o755 } )
			// run all tasks
			.then( () => grunt.task.run( tasks ) )
			.then( done, grunt.fail.fatal );
	}

	grunt.task.registerTask(
		"dist",
		"Compile the built application, package and checksum it.",
		taskDist
	);
};
