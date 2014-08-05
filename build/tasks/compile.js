module.exports = function( grunt ) {
	"use strict";

	var	configs = {
			"win"		: { platform:  "win32", arch:  null, tasks: [] },
			"osx"		: { platform: "darwin", arch:  null, tasks: [] },
			"linux32"	: { platform:  "linux", arch: "x86", tasks: [
				"copy:linux32scripts",
				"copy:linux32icons"
			] },
			"linux64"	: { platform:  "linux", arch: "x64", tasks: [
				"copy:linux64scripts",
				"copy:linux64icons"
			] }
		};

	grunt.task.registerTask(
		"compile",
		"Compile the built project with node-webkit and compress it. " +
			"Optional platforms: all:" + Object.keys( configs ).join( ":" ),
		function() {
			var platforms = Object.keys( this.flags );

			// compile for all platforms
			if ( platforms.length === 1 && platforms[0] === "all" ) {
				platforms = Object.keys( configs );

			// compile for current platform
			} else if ( platforms.length === 0 ) {
				platforms = Object.keys( configs ).filter(function( platform ) {
					var config = configs[ platform ];
					return	config.platform === process.platform
						&&	( config.arch === null || config.arch === process.arch );
				});

			// search for invalid flags
			} else if ( !platforms.every(function( platform ) {
				return platform in configs;
			}) ) {
				return grunt.fail.fatal(
					"Invalid platforms. " +
					"Valid platforms are: all:" + Object.keys( configs ).join( ":" )
				);
			}

			platforms.forEach(function( platform ) {
				grunt.task.run( []
					// always run these tasks
					.concat([ "nodewebkit:" + platform ])
					// conditional tasks
					.concat( configs[ platform ].tasks )
					// also run these tasks afterwards
					.concat([ "compress:" + platform ])
				);
			});
		}
	);

};
