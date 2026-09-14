module.exports = function( grunt ) {
	function taskNwjs() {
		const done = this.async();
		const { cwd, ...options } = this.options();

		if ( this.flags.debug ) {
			options.flavor = "sdk";
		}

		options.mode = "build";

		// nw-builder resolves each globbed srcDir file directly against outDir without
		// stripping any srcDir prefix, so srcDir globs are written relative to `cwd`
		// (see build/tasks/configs/nwjs.js) and applied here instead.
		const prevCwd = process.cwd();
		if ( cwd ) {
			process.chdir( cwd );
		}

		import( "nw-builder" )
			.then( ( { default: nwbuild } ) => nwbuild( options ) )
			.then( () => {
				grunt.log.ok( "NW.js application created." );
			}, grunt.fail.fatal )
			.finally( () => {
				process.chdir( prevCwd );
				done();
			});
	}

	grunt.registerMultiTask(
		"nwjs",
		"Create an NW.js build of the application",
		taskNwjs
	);
};
