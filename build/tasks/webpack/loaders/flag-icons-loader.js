module.exports = function( content ) {
	const done = this.async();
	const { config, ignore } = this.query;

	this.addDependency( config );

	new Promise( ( resolve, reject ) => {
		this.loadModule( config, ( err, source ) => err
			? reject( err )
			: resolve( JSON.parse( source ) )
		);
	})
		.then( langs => {
			const flagIcons = Object.keys( langs )
				.filter( key => ignore.indexOf( key ) === -1 )
				.map( key => `.flag-icon(${langs[ key ].flag});` )
				.sort()
				.reduce( ( list, line ) => {
					if ( list.indexOf( line ) === -1 ) {
						list.push( line );
					}
					return list;
				}, [] )
				.join( "\n" );

			return `${content}\n\n\n${flagIcons}`;
		})
		.then(
			data => done( null, data ),
			err => done( err )
		);
};
