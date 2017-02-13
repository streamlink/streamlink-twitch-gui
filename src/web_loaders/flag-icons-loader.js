
module.exports = function( content ) {
	const { config, ignore } = this.query;

	const langs = require( config );
	this.addDependency( config );

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
};
