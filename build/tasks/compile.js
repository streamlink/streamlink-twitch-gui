
module.exports = function( grunt ) {
	"use strict";

	grunt.task.registerMultiTask(
		"compile",
		"Compile the built project with node-webkit for your platform",
		function() {
			switch ( process.platform ) {
				case "win32":
					grunt.task.run( [ "nodewebkit:win", "compress:win" ] );
					return;
				case "mac":
					grunt.task.run( [ "nodewebkit:mac", "compress:mac" ] );
					return;
				case "linux":
					switch ( process.arch ) {
						case "x86":
							grunt.task.run( [ "nodewebkit:linux32", "compress:linux32" ] );
							return;
						case "x64":
							grunt.task.run( [ "nodewebkit:linux64", "compress:linux64" ] );
							return;
					}
			}
			grunt.fail.fatal( "Could not compile for your platform" );
		}
	);

};
