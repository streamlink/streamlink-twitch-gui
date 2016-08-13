var platforms = require( "../common/platforms" );


module.exports = function( grunt ) {
	var task  = "dist";
	var descr = "Build the project, compile and compress it. " + platforms.getList();

	grunt.task.registerTask( task, descr, function() {
		grunt.task.run( []
			// build
			.concat([ "build:prod" ])
			// compile
			.concat( platforms.getTasks( "compile", arguments ) )
			// compress
			.concat( platforms.getTasks( "compress", arguments ) )
		);
	});
};
