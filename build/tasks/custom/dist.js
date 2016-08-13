module.exports = function( grunt ) {
	"use strict";

	var platforms = require( "../common/platforms" );

	grunt.task.registerTask(
		"dist",
		"Build the project, compile and compress it. " + platforms.getList(),
		function() {
			grunt.task.run( []
				// build
				.concat([ "build:prod" ])
				// compile
				.concat( platforms.getTasks( grunt, "compile", arguments ) )
				// compress
				.concat( platforms.getTasks( grunt, "compress", arguments ) )
			);
		}
	);

};
