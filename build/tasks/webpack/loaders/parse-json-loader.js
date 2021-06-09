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
				const promise = new Promise( ( resolve, reject ) => {
					this.loadModule( value.substr( 1 ), ( err, source, sourceMap, module ) => {
						if ( err ) {
							return reject( err );
						}
						obj[ key ] = relative( this.rootContext, module.resource )
							.replace( /\\/g, "/" );
						resolve();
					});
				});
				promises.push( promise );
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
