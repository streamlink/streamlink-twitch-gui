var PATH = require( "path" );

module.exports = function( grunt ) {
	"use strict";

	// load custom tasks
	grunt.loadTasks( "build/tasks/custom" );

	// load task configs
	require( "load-grunt-config" )( grunt, {
		// load config files and avoid file name collisions
		overridePath: PATH.join( process.cwd(), "build", "tasks", "configs" ),
		configPath  : PATH.join( process.cwd(), "src", "config" ),

		// automatically initialize and load modules on demand
		init    : true,
		jitGrunt: true
	});
};
