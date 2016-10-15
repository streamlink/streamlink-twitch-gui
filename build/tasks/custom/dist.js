var platforms = require( "../common/platforms" );
var getReleaseChangelog = require( "../common/release-changelog" );
var changelogFile = require( "path" ).resolve( "CHANGELOG.md" );
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
		var done = this.async();

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

		var tasks = [];
		// compile the application once for every given platform
		tasks.push.apply( tasks, targets
			// unique
			.reduce(function( list, target ) {
				var platform = config[ target ].platform;
				if ( list.indexOf( platform ) === -1 ) {
					list.push( platform );
				}
				return list;
			}, [] )
			.map(function( platform ) {
				return "compile:" + platform;
			})
		);

		// run all "main" tasks
		tasks.push.apply( tasks, targets
			// flatten
			.reduce(function( list, target ) {
				var tasks = config[ target ].tasks || [];
				list.push.apply( list, tasks );
				return list;
			}, [] )
		);

		// run all "after" tasks
		tasks.push.apply( tasks, targets
			// unique & flatten
			.reduce(function( list, target ) {
				var after = config[ target ].after || [];
				after.forEach(function( task ) {
					if ( list.indexOf( task ) === -1 ) {
						list.push( task );
					}
				});
				return list;
			}, [] )
		);

		// checksum (explicit target list)
		var checksumTargets = targets.filter(function( target ) {
			return config[ target ].hasOwnProperty( "checksum" );
		});
		if ( checksumTargets.length ) {
			tasks.push( "checksum:" + checksumTargets.join( ":" ) );
		}

		// read changelog
		getReleaseChangelog( { changelogFile: changelogFile }, grunt.config.get( "package" ) )
			.then(function( data ) {
				grunt.config.set( "releases", {
					changelog: data
				});
				tasks.push( "template:releases" );
			})
			.then(function() {
				// run all tasks
				grunt.task.run( tasks );
				done();
			});
	});
};
