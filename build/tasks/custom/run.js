module.exports = async function( grunt ) {
	const nwbuild = (await import( "nw-builder" )).default;
	const platforms = require( "../common/platforms" );
	const { resolve: r } = require( "path" );

	function taskRun() {
		const done = this.async();
		const options = this.options({
			platforms: [ platforms.getPlatform() ]
		});

		options.files = r( process.cwd(), this.data.src );

		nwbuild(options).then( done, grunt.fail.fatal );
	}

	grunt.task.registerMultiTask(
		"run",
		"Run the previously built NW.js application",
		taskRun
	);
};
