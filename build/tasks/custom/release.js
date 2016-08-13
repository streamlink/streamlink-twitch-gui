module.exports = function( grunt ) {
	"use strict";

	var platforms = require( "../common/platforms" );

	grunt.task.registerTask(
		"release",
		"Build and compile the project. " + platforms.getList(),
		function() {
			grunt.task.run( []
				// build
				.concat([ "build:prod" ])
				// compile
				.concat( platforms.getTasks( grunt, "compile", arguments ) )
			);
		}
	);

};
