var r = require( "path" ).resolve;


module.exports = function( grunt ) {
	"use strict";

	// load custom tasks
	grunt.loadTasks( "build/tasks/custom" );

	// load task configs
	require( "load-grunt-config" )( grunt, {
		// load config files and avoid file name collisions
		overridePath: r( "build", "tasks", "configs" ),
		configPath  : r( "src", "config" ),

		data: {
			dir: {
				root: r( "." ),
				cache: r( "build", "cache" ),
				package: r( "build", "package" ),
				releases: r( "build", "releases" ),
				resources: r( "build", "resources" ),
				tmp: r( "build", "tmp" ),
				tmp_dev: r( "build", "tmp", "dev" ),
				tmp_prod: r( "build", "tmp", "prod" ),
				tmp_test: r( "build", "tmp", "test" ),
				dist: r( "dist" )
			}
		},

		// automatically initialize and load modules on demand
		init    : true,
		jitGrunt: true
	});
};
