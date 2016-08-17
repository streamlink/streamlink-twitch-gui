var platforms = require( "../common/platforms" );


module.exports = function( grunt ) {
	var task  = "release";
	var descr = "Build and compile the application. " + platforms.getList();

	grunt.task.registerTask( task, descr, function() {
		grunt.task.run( []
			// build
			.concat([ "build:prod" ])
			// compile
			.concat( platforms.getTasks( "compile", arguments ) )
		);
	});
};
