module.exports = function( grunt ) {
	"use strict";

	var platforms = require( "../common/platforms" );

	grunt.task.registerTask(
		"dist",
		"Build the project, compile and compress it. " + platforms.getList(),
		function() {
			grunt.task.run( []
				// make a fresh build
				.concat([ "buildrelease" ])
				// compile
				.concat( platforms.getTasks( grunt, "compile", arguments ) )
				// compress
				.concat( platforms.getTasks( grunt, "compress", arguments ) )
			);
		}
	);

};
