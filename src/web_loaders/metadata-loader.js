const CP = require( "child_process" );
const FS = require( "fs" );
const denodify = require( "../app/utils/node/denodify" );
const StreamOutputBuffer = require( "../app/utils/StreamOutputBuffer" );


module.exports = function() {
	const callback = this.async();

	const {
		dependencyProperties,
		packageNpm,
		packageBower,
		donationConfigFile
	} = this.query;

	this.addDependency( packageNpm );
	this.addDependency( packageBower );
	this.addDependency( donationConfigFile );
	this.cacheable( false );

	const readFile = denodify( FS.readFile );
	const readPackageNpm = readFile( packageNpm ).then( JSON.parse );
	const readPackageBower = readFile( packageBower ).then( JSON.parse );


	function promiseExec( exec, params ) {
		return new Promise(function( resolve, reject ) {
			const data = [];
			let spawn = CP.spawn( exec, params );

			function onError( err ) {
				spawn = null;
				reject( err );
			}

			function onExit( code, status ) {
				spawn = null;
				if ( code > 0 ) {
					reject( new Error( status ) );
				} else {
					resolve( String( data ) );
				}
			}

			function onStdOut( line ) {
				data.push( line );
			}

			const streamoutputbuffer = new StreamOutputBuffer( {
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
			.then( ([ json, version ]) => ({
				homepage: json.homepage,
				author: json.author,
				version: json.version,
				versionstring: version.replace( /^v/, "" ),
				built: new Date().toISOString()
			}) );
	}

	function promiseDependencies() {
		function merge( obj, nestedItem ) {
			Object.keys( nestedItem )
				.forEach( key => obj[ key ] = nestedItem[ key ] );
			return obj;
		}

		return Promise.all([
			readPackageBower,
			readPackageNpm
		])
			.then( files => files
				// find dependencies
				.map( json => dependencyProperties
					.map( property => json[ property ] || {} )
					.reduce( merge, {} )
				)
				// merge all dependencies
				.reduce( merge, {} )
			);
	}

	function getDonationData() {
		return readFile( donationConfigFile )
			.then( JSON.parse )
			.then( data => data[ "donation" ] );
	}


	Promise.all([
		promisePackageData(),
		promiseDependencies(),
		getDonationData()
	])
		.then( ([ packageData, dependencies, donation ]) => {
			const data = JSON.stringify({ "package": packageData, dependencies, donation });
			callback( null, `module.exports=${data}` );
		}, callback );
};
