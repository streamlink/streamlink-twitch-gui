module.exports = function( grunt ) {
	const platforms = require( "../common/platforms" );

	function taskRelease() {
		const [ debug, targets ] = platforms.getDebugTargets( this.args );

		grunt.task.run([
			// build
			`build:${debug ? "debug" : "prod"}`,
			// compile
			...platforms.getPlatforms( ...targets )
				.map( platform => `compile:${platform}${debug ? ":debug": ""}` )
		]);
	}

	grunt.task.registerTask(
		"release",
		`Build and compile the application. ${platforms.getList()}`,
		taskRelease
	);
};
