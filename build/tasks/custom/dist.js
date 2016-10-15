var platforms = require( "../common/platforms" );
var config = require( "../configs/dist" );
var configKeys = Object.keys( config )
	.filter(function( item ) {
		return item !== "options";
	});


module.exports = function( grunt ) {
	var task  = "dist";
	var descr = "Compile the built application, package and checksum it."
		+ " Optional platforms: all:" + configKeys.join( ":" );

	grunt.task.registerTask( task, descr, function() {
		/** @type {string[]} target */
		var targets = ( !this.args.length
			// default target is an archive for the current platform
			? [ platforms.getPlatforms([]) + "archive" ]
			: this.args
		)
			.reduce(function( list, target ) {
				if ( target === "all" ) {
					configKeys.forEach(function( item ) {
						if ( list.indexOf( item ) === -1 ) {
							list.push( item );
						}
					});
				} else {
					if ( list.indexOf( target ) === -1 ) {
						list.push( target );
					}
				}
				return list;
			}, [] );

		// validate all targets
		if ( !targets.every( config.hasOwnProperty.bind( config ) ) ) {
			grunt.fail.fatal( "Invalid dist task parameters" );
		}

		// compile the application once for every given platform
		grunt.task.run( targets
			.map(function( target ) {
				return config[ target ].platform;
			})
			// unique
			.reduce(function( list, platform ) {
				if ( list.indexOf( platform ) === -1 ) {
					list.push( platform );
				}
				return list;
			}, [] )
			.map(function( platform ) {
				return "compile:" + platform;
			})
		);

		// run all main tasks
		grunt.task.run( targets
			.map(function( target ) {
				return config[ target ].tasks;
			})
			// flatten
			.reduce(function( list, curr ) {
				list.push.apply( list, curr || [] );
				return list;
			}, [] )
		);

		// checksum (explicit target list)
		grunt.task.run( "checksum:" + targets.join( ":" ) );
	});
};
