const CP = require( "child_process" );
const loaderUtils = require( "loader-utils" );


module.exports = function() {
	const callback = this.async();
	this.cacheable( false );

	const { package: pkg, built } = loaderUtils.getOptions( this );


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
					resolve( data.join( "" ).split( /[\r\n]+/ ).slice( 0, -1 ) );
				}
			}

			function onStdOut( chunk ) {
				data.push( chunk );
			}

			spawn.on( "error", onError );
			spawn.on( "exit", onExit );
			spawn.stdout.on( "data", onStdOut );
		});
	}


	promiseExec( "git", [ "describe", "--tags" ] )
		.then( ([ versionstring ]) => {
			callback( null, JSON.stringify({
				versionstring,
				built,
				author: pkg.author,
				dependencies: [ "dependencies", "devDependencies" ]
					.reduce( ( obj, key ) => Object.assign( obj, pkg[ key ] ), {} )
			}) );
		}, callback );
};
