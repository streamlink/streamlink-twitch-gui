var CP = require( "child_process" );
var FS = require( "fs" );
var PATH = require( "path" );
var denodify = require( "../app/utils/node/denodify" );
var StreamOutputBuffer = require( "../app/utils/StreamOutputBuffer" );

var root = PATH.resolve( __dirname, "..", ".." );
var packageNpm   = PATH.join( root, "package.json" );
var packageBower = PATH.join( root, "bower.json" );

var dependencyProperties = [ "dependencies", "devDependencies" ];
var minCommits = 2;


module.exports = function() {
	var callback = this.async();

	this.addDependency( packageNpm );
	this.addDependency( packageBower );
	this.cacheable();

	var readFile = denodify( FS.readFile );
	var readPackageNpm   = readFile( packageNpm ).then( JSON.parse );
	var readPackageBower = readFile( packageBower ).then( JSON.parse );


	function promiseExec( exec, params ) {
		return new Promise(function( resolve, reject ) {
			var data = [];
			var spawn = CP.spawn( exec, params );

			function onError( err ) {
				spawn = null;
				reject( err );
			}

			function onExit( code, status ) {
				spawn = null;
				if ( code > 0 ) {
					reject( new Error( status ) );
				} else {
					resolve( data );
				}
			}

			function onStdOut( line ) {
				data.push( line );
			}

			var streamoutputbuffer = new StreamOutputBuffer({
				maxBuffSize: 1024 * 64
			}, onStdOut );

			spawn.on( "error", onError );
			spawn.on( "exit", onExit );
			spawn.stdout.on( "data", streamoutputbuffer );
		});
	}


	function promisePackageData() {
		return Promise.all([
			readPackageNpm,
			promiseExec( "git", [ "describe", "--tags" ] )
		])
			.then(function( data ) {
				var json = data[0];
				var version = data[1];

				return {
					homepage: json.homepage,
					author: json.author,
					version: json.version,
					versionstring: version,
					built: new Date().toISOString()
				};
			});
	}

	function promiseGitContributors() {
		return promiseExec( "git", [ "log", "--format=%aN <%cE>" ] )
			.then(function( output ) {
				var reRow = /^(.+) <(.+)>$/;

				return output
					// create commit objects
					.map(function( row ) {
						var match = row.match( reRow );
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
						return contributor.commits >= minCommits;
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

	function promiseDependencies() {
		function merge( obj, nestedItem ) {
			Object.keys( nestedItem ).forEach(function( key ) {
				obj[ key ] = nestedItem[ key ];
			});
			return obj;
		}

		return Promise.all([
			readPackageBower,
			readPackageNpm
		])
			.then(function( files ) {
				return files
					// find dependencies
					.map(function( json ) {
						return dependencyProperties
							.map(function( property ) {
								return json[ property ] || {};
							})
							.reduce( merge, {} );
					})
					// merge all dependencies
					.reduce( merge, {} );
			});
	}

	function getDonationData() {
		return process.env.hasOwnProperty( "RELEASES_DONATION" )
			? JSON.parse( process.env.RELEASES_DONATION )
			: [];
	}


	Promise.all([
		promisePackageData(),
		promiseGitContributors(),
		promiseDependencies(),
		getDonationData()
	])
		.then(function( data ) {
			callback( null, "module.exports=" + JSON.stringify({
				"package"     : data[0],
				"contributors": data[1],
				"dependencies": data[2],
				"donation"    : data[3]
			}) );
		}, callback );
};
