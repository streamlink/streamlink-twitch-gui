const CP = require( "child_process" );
const FS = require( "fs" );
const promisify = require( "util.promisify" );
const StreamOutputBuffer = require( "../app/utils/StreamOutputBuffer" );


module.exports = function() {
	const callback = this.async();

	const {
		dependencyProperties,
		packageJson,
		donationConfigFile
	} = this.query;

	this.addDependency( packageJson );
	this.addDependency( donationConfigFile );
	this.cacheable( false );

	/**
	 * @type {Function}
	 * @returns {Promise}
	 */
	const readFile = promisify( FS.readFile );
	const readPackageJson = readFile( packageJson ).then( JSON.parse );


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
			readPackageJson,
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

		return readPackageJson
			// merge dependencies
			.then( json => dependencyProperties
				.map( property => json[ property ] || {} )
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
