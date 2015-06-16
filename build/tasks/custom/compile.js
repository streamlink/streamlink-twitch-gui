module.exports = function( grunt ) {
	"use strict";

	var	platforms = require( "../common/platforms" ),
		tasks = require( "../configs/compile" );

	grunt.task.registerTask(
		"compile",
		"Compile the built project. " + platforms.getList(),
		function() {
			platforms.getPlatform( grunt, arguments )
				.forEach(function( platform ) {
					grunt.task.run( []
						// run these tasks before the compilation
						.concat( tasks[ platform ].before || [] )
						// the actual compile tasks
						.concat([ "nwjs:" + platform ])
						// run these tasks after the compilation
						.concat( tasks[ platform ].after || [] )
					);
				});
		}
	);

};
