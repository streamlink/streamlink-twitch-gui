module.exports = function( grunt ) {
	"use strict";

	var	configs = {
			"win"		: { platform:  "win32", arch:  null, tasks: [ "nodewebkit:win", "compress:win" ] },
			"mac"		: { platform: "darwin", arch:  null, tasks: [ "nodewebkit:mac", "compress:mac" ] },
			"linux32"	: { platform:  "linux", arch: "x86", tasks: [ "nodewebkit:linux32", "copy:linux32start", "compress:linux32" ] },
			"linux64"	: { platform:  "linux", arch: "x64", tasks: [ "nodewebkit:linux64", "copy:linux64start", "compress:linux64" ] }
		};

	grunt.task.registerTask(
		"compile",
		"Compile the built project with node-webkit and compress it. " +
			"Optional targets: all:" + Object.keys( configs ).join( ":" ),
		function() {
			var tasks = Object.keys( this.flags );

			// compile for all platforms
			if ( tasks.length === 1 && tasks[0] === "all" ) {
				tasks = Object.keys( configs );

			// compile for current platform
			} else if ( tasks.length === 0 ) {
				tasks = Object.keys( configs ).filter(function( task ) {
					var config = configs[ task ];
					return	config.platform === process.platform
						&&	( config.arch === null || config.arch === process.arch );
				});

			// search for invalid flags
			} else if ( !tasks.every(function( task ) {
				return task in configs;
			}) ) {
				return grunt.fail.fatal(
					"Invalid targets. " +
					"Valid targets are: all:" + Object.keys( configs ).join( ":" )
				);
			}

			tasks.forEach(function( task ) {
				grunt.task.run( configs[ task ].tasks );
			});
		}
	);

};
