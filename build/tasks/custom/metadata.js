/*
 * Create a new 'metadata' JSON file containing all informations about this project.
 * This file will be embedded into the application.
 */

module.exports = function( grunt ) {
	"use strict";

	var Q  = require( "q" );
	var FS = require( "q-io/fs" );

	grunt.task.registerMultiTask(
		"metadata",
		"Create a new 'metadata' JSON file containing all informations about this project.",
		function() {
			var done = this.async();

			// do some stuff asynchronously
			Q.all([
				promisePackageData(),
				promiseGitContributors( this.data.contributors ),
				promiseDependencies( this.data.dependencies )
			])
				// generate the final file contents
				.then( buildJSON )
				.then( JSON.stringify )
				// write the file
				.then( FS.write.bind( FS, this.data.dest ) )
				// and we're finally done...
				.then( done, grunt.fail.fatal );
		}
	);


	/**
	 * The final JSON object
	 */
	function buildJSON( objects ) {
		return {
			"package": objects[0],
			"contributors": objects[1],
			"dependencies": objects[2]
		};
	}


	/**
	 * Read some data from the package.json file
	 */
	function promisePackageData() {
		return FS.read( "package.json" )
			.then( JSON.parse )
			.then(function( json ) {
				return {
					homepage: json.homepage,
					author: json.author,
					version: json.version,
					built: grunt.template.today( "isoUtcDateTime" )
				};
			});
	}

	/**
	 * Get a list of all contributors to this repository
	 * Each entry contains the name and the number of commits
	 */
	function promiseGitContributors( data ) {
		return Q.nfcall( grunt.util.spawn, {
			cmd: "git",
			args: [ "log", "--format=%aN <%cE>" ]
		})
			.then(function( output ) {
				return String( output )
					.split( "\n" )
					// create commit objects
					.map(function( row ) {
						var match = row.match( /^(.+) <(.+)>$/ );
						return match
							? { name: match[1], email: match[2], commits: 1 }
							: null;
					})
					.filter(function( commit ) {
						return commit !== null;
					})
					// first: sort commit rows by email address
					.sort(function( a, b ) {
						return a.email === b.email
							? 0
							: a.email > b.email
								? -1
								:  1;
					})
					// then: group equal email addresses (build contributor objects)
					.reduce(function( prev, curr ) {
						if ( prev.length && prev[ prev.length - 1 ].email === curr.email ) {
							prev[ prev.length - 1 ].commits++;
							return prev;
						} else {
							return prev.concat( curr );
						}
					}, [] )
					// filter by commit count
					.filter(function( contributor ) {
						return contributor.commits >= data.minCommits;
					})
					// sort by commit count
					.sort(function( a, b ) {
						return b.commits - a.commits;
					})
					// we don't store email addresses
					.map(function( contributor ) {
						delete contributor.email;
						return contributor;
					});
			});
	}

	/**
	 * Get a list of all dependencies of this project (including the build process)
	 */
	function promiseDependencies( files ) {
		return Q.all(
			Object.keys( files ).map(function( file ) {
				// read each file containing dependency metadata
				return FS.read( file )
					.then( JSON.parse )
					.then(function( json ) {
						return files[ file ]
							// get all dependency objects
							.map(function( property ) {
								return json[ property ] || {};
							})
							// merge multiple dependency objects
							.reduce(function( deps, list ) {
								Object.keys( list ).forEach(function( dep ) {
									deps[ dep ] = list[ dep ];
								});
								return deps;
							}, {} );
					});
			})
		)
			// merge all dependencies
			.then(function( lists ) {
				return lists.reduce(function( deps, list ) {
					Object.keys( list ).forEach(function( dep ) {
						deps[ dep ] = list[ dep ];
					});
					return deps;
				}, {} );
			});
	}

};
