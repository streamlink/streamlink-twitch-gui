const platforms = require( "../common/platforms" );


module.exports = function( grunt ) {
	const task = "release";
	const descr = `Build and compile the application. ${platforms.getList()}`;

	grunt.task.registerTask( task, descr, function() {
		grunt.task.run([
			// build
			"build:prod",
			// compile
			...platforms.getTasks( "compile", arguments )
		]);
	});
};
