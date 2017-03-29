const platforms = require( "../common/platforms" );
const getReleaseChangelog = require( "../common/release-changelog" );
const changelogFile = require( "path" ).resolve( "CHANGELOG.md" );
const config = require( "../configs/dist" );
const configKeys = Object.keys( config )
	.filter( item => item !== "options" );


module.exports = function( grunt ) {
	const task = "dist";
	const descr = [
		"Compile the built application, package and checksum it.",
		`Optional platforms: all:${configKeys.join( ":" )}`
	].join( " " );

	grunt.task.registerTask( task, descr, function() {
		const done = this.async();

		/** @type {String[]} target */
		const targets = ( !this.args.length
			// default target is an archive for the current platform
			? [ `${platforms.getPlatforms()}archive` ]
			: this.args
		)
			.reduce( ( list, target ) => {
				if ( target === "all" ) {
					configKeys.forEach( item => {
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
		if ( !targets.every( item => config.hasOwnProperty( item ) ) ) {
			return grunt.fail.fatal( "Invalid dist task parameters" );
		}

		const tasks = [];
		// compile the application once for every given platform
		tasks.push.apply( tasks, targets
			// unique
			.reduce( ( list, target ) => {
				const platform = config[ target ].platform;
				if ( list.indexOf( platform ) === -1 ) {
					list.push( platform );
				}
				return list;
			}, [] )
			.map( platform => `compile:${platform}` )
		);

		// run all "main" tasks
		tasks.push.apply( tasks, targets
			// flatten
			.reduce( ( list, target ) => {
				const tasks = config[ target ].tasks || [];
				list.push.apply( list, tasks );
				return list;
			}, [] )
		);

		// run all "after" tasks
		tasks.push.apply( tasks, targets
			// unique & flatten
			.reduce( ( list, target ) => {
				const after = config[ target ].after || [];
				after.forEach( task => {
					if ( list.indexOf( task ) === -1 ) {
						list.push( task );
					}
				});
				return list;
			}, [] )
		);

		// checksum (explicit target list)
		const checksumTargets = targets.filter( target =>
			config[ target ].hasOwnProperty( "checksum" )
		);
		if ( checksumTargets.length ) {
			tasks.push( `checksum:${checksumTargets.join( ":" )}` );
		}

		// read changelog
		getReleaseChangelog( { changelogFile: changelogFile }, grunt.config.get( "package" ) )
			.then( data => {
				grunt.config.set( "releases", {
					changelog: data
				});
				tasks.push( "template:releases" );
			})
			.then( () => {
				// run all tasks
				grunt.task.run( tasks );
				done();
			});
	});
};
