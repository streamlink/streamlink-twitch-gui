var PATH = require( "path" );
var langs = require( "../config/langs.json" );

var ignore = [ "en" ];


module.exports = function( content ) {
	this.addDependency( PATH.resolve( "..", "config", "langs.json" ) );

	var flagIcons = Object.keys( langs )
		.filter(function( key ) {
			return ignore.indexOf( key ) === -1;
		})
		.map(function( key ) {
			return ".flag-icon(" + langs[ key ].flag + ");";
		})
		.sort()
		.reduce(function( list, line ) {
			// n^2 (who cares...)
			if ( list.indexOf( line ) === -1 ) {
				list.push( line );
			}
			return list;
		}, [] )
		.join( "\n" );

	return content + "\n\n\n" + flagIcons;
};
