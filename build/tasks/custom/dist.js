var platforms = require( "../common/platforms" );


module.exports = function( grunt ) {
	var task  = "dist";
	var descr = "Build the application, compile, compress and checksum it. " + platforms.getList();

	grunt.task.registerTask( task, descr, function() {
		grunt.task.run( []
			// build
			.concat([ "build:prod" ])
			// compile
			.concat( platforms.getTasks( "compile", arguments ) )
			// compress
			.concat( platforms.getTasks( "compress", arguments ) )
			// checksum
			.concat([ "checksum:" + [].slice.call( arguments ).join( ":" ) ])
		);
	});
};
