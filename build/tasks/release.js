module.exports = function( grunt ) {
	"use strict";

	grunt.task.registerTask(
		"release",
		"Build the project and compile it for your or any platform. " +
			"See compile task for possible targets.",
		function() {
			grunt.task.run([ "buildrelease" ].concat(
				arguments.length
					? [].map.call( arguments, function( platform ) {
						return "compile:" + platform;
					})
					: "compile"
			));
		}
	);

};
