const { relative } = require( "path" );


module.exports = function( content ) {
	const callback = this.async();
	this.cacheable();

	const promises = [];
	const parse = obj => {
		for ( const [ key, value ] of Object.entries( obj ) ) {
			const type = typeof value;
			if ( type === "object" && value ) {
				parse( value );

			} else if ( type === "string" && value.startsWith( "~" ) ) {
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
