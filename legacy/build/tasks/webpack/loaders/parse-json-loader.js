const { relative } = require( "path" );


module.exports = function( content ) {
	const callback = this.async();
	this.cacheable( false );

	const { grunt } = this.query;

	const promises = [];
	const parse = obj => {
		for ( let [ key, value ] of Object.entries( obj ) ) {
			const type = typeof value;
			if ( type === "object" && value ) {
				parse( value );
				continue;
			}

			const isString = type === "string";

			if ( isString && value.includes( "<%=" ) ) {
				obj[ key ] = value = grunt.config.process( value );
			}

			if ( isString && value.startsWith( "~" ) ) {
				promises.push( ( ( obj, key ) =>
					new Promise( ( resolve, reject ) => {
						this.loadModule( value.slice( 1 ), ( err, source, sourceMap, module ) => {
							if ( err ) {
								return reject( err );
							}
							obj[ key ] = relative( this.rootContext, module.resource )
								.replace( /\\/g, "/" );
							this.emitFile( obj[ key ], source, sourceMap );
							resolve();
						} );
					} )
				)( obj, key ) );
			}
		}
	};

	const data = JSON.parse( content );
	parse( data );
	Promise.all( promises ).then(
		() => callback( null, JSON.stringify( data, undefined, "\t" ) ),
		callback
	);
};
