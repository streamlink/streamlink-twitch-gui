module.exports = function( grunt ) {
	const platforms = require( "../common/platforms" );

	function taskRelease() {
		grunt.task.run([
			// build
			"build:prod",
			// compile
			...platforms.getPlatforms( ...this.args )
				.map( platform => `compile:${platform}` )
		]);
	}

	grunt.task.registerTask(
		"release",
		`Build and compile the application. ${platforms.getList()}`,
		taskRelease
	);
};
