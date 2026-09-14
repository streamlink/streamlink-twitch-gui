module.exports = function( grunt ) {
	const platforms = require( "../common/platforms" );
	const { resolve: r } = require( "path" );

	function taskRun() {
		const done = this.async();
		const options = this.options(
			platforms.getNwBuildTarget( platforms.getPlatform() )
		);

		options.mode = "run";
		options.glob = false;
		options.srcDir = r( process.cwd(), this.data.src );

		import( "nw-builder" )
			.then( ( { default: nwbuild } ) => nwbuild( options ) )
			.then( done, grunt.fail.fatal );
	}

	grunt.task.registerMultiTask(
		"run",
		"Run the previously built NW.js application",
		taskRun
	);
};
