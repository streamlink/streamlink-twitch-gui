"use strict";

var NwBuilder = require( "node-webkit-builder" );

module.exports = function( grunt ) {
	var name  = "nwjs";
	var descr = "Build the NW.js application";

	grunt.registerMultiTask( name, descr, function() {
		var done      = this.async();
		var options   = this.options();

		options.files = this.filesSrc;

		var nw = new NwBuilder( options );

		nw.on( "log", function( log ) {
			grunt.log.debug( log );
		});

		nw.build(function( err ) {
			if ( err ) {
				grunt.fail.fatal( err );
			} else {
				grunt.log.ok( "NW.js application created." );
			}
			done();
		});
	});

};
