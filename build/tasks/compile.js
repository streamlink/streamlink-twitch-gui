module.exports = function( grunt ) {
	"use strict";

	var	configs = {
			"win"		: { task:     "win", platform:  "win32", arch:  null },
			"mac"		: { task:     "mac", platform: "darwin", arch:  null },
			"linux32"	: { task: "linux32", platform:  "linux", arch: "x86" },
			"linux64"	: { task: "linux64", platform:  "linux", arch: "x64" }
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
				task = configs[ task ].task;
				grunt.task.run([ "nodewebkit:" + task, "compress:" + task ]);
			});
		}
	);

};
