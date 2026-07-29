module.exports = function( grunt ) {
	const NwBuilder = require( "nw-builder" );

	function taskNwjs() {
		const done = this.async();
		const options = this.options();

		if ( this.flags.debug ) {
			options.flavor = "sdk";
		}

		const nw = new NwBuilder( options );

		nw.on( "log", grunt.log.debug );
		nw.on( "stdout", grunt.log.debug );
		nw.on( "stderr", grunt.log.debug );

		nw.build()
			.then( () => {
				grunt.log.ok( "NW.js application created." );
				done();
			}, grunt.fail.fatal );
	}

	grunt.registerMultiTask(
		"nwjs",
		"Create an NW.js build of the application",
		taskNwjs
	);
};
