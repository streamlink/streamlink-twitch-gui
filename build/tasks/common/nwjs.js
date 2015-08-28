"use strict";

var path      = require( "path" );
var NwBuilder = require( "nw-builder" );
var nwoptions = require( "../configs/nwjs" ).options;
var platforms = require( "../common/platforms" );


module.exports = function( grunt, src, options ) {
	options.files     = path.resolve( process.cwd(), src );
	options.platforms = platforms.getPlatform( grunt, [] );

	Object.keys( nwoptions ).forEach(function( key ) {
		if ( !options.hasOwnProperty( key ) ) {
			options[ key ] = grunt.config.process( nwoptions[ key ] );
		}
	});

	return new NwBuilder( options );
};
