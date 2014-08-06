module.exports = function( grunt ) {
	"use strict";

	// load custom tasks
	grunt.loadTasks( "build/tasks/custom" );

	// load task configs
	require( "load-grunt-config" )( grunt, {
		configPath		: require( "path" ).join( process.cwd(), "build", "tasks", "configs" ),
		init			: true
	});

};
