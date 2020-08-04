module.exports = function( grunt ) {
	const NwBuilder = require( "nw-builder" );
	const platforms = require( "../common/platforms" );
	const { resolve: r } = require( "path" );

	function taskRun() {
		const done = this.async();
		const options = this.options({
			platforms: [ platforms.getPlatform() ]
		});

		options.files = r( process.cwd(), this.data.src );

		const nw = new NwBuilder( options );

		nw.on( "log", grunt.log.writeln.bind( grunt.log ) );
		nw.on( "stdout", grunt.log.writeln.bind( grunt.log ) );
		nw.on( "stderr", grunt.log.writeln.bind( grunt.log ) );

		nw.run().then( done, grunt.fail.fatal );
	}

	grunt.task.registerMultiTask(
		"run",
		"Run the previously built NW.js application",
		taskRun
	);
};
