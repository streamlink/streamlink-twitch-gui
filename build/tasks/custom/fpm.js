"use strict";

var CP = require( "child_process" );


module.exports = function( grunt ) {

	grunt.registerMultiTask( "fpm", "Build packages via fpm", function() {
		var done    = this.async();
		var options = this.options();

		var args = [];

		Object.keys( options ).forEach(function( key ) {
			var option = options[ key ];
			var type   = typeof option;
			var name   = ( key.length === 1 ? "-" : "--" ) + key;

			if ( type === "string" ) {
				args.push( name, option );

			} else if ( type === "boolean" ) {
				if ( !option ) { return; }
				args.push( name );

			} else if ( Array.isArray( option ) ) {
				option.forEach(function( item ) {
					args.push( name, item );
				});

			} else if ( type === "object" ) {
				Object.keys( option ).forEach(function( prop ) {
					args.push( name, prop + "=" + option[ prop ] );
				});

			} else {
				grunt.fail.fatal( "Invalid fpm option: " + key );
			}
		});

		grunt.log.debug( args );


		var spawn = CP.spawn( "fpm", args );

		spawn.stdout.on( "data", grunt.log.write );
		spawn.stderr.on( "data", grunt.log.error );

		spawn.on( "error", grunt.fail.fatal );
		spawn.on( "exit", function( code ) {
			if ( code === 0 ) {
				grunt.log.ok( "Success" );
			} else {
				grunt.fail.fatal( "Fail (code " + code + ")" );
			}
			done();
		});
	});

};
