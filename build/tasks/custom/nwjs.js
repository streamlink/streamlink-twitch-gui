var NwBuilder = require( "nw-builder" );


module.exports = function( grunt ) {
	var task  = "nwjs";
	var descr = "Build the NW.js application";

	grunt.registerMultiTask( task, descr, function() {
		var done      = this.async();
		var options   = this.options({
			files: this.filesSrc
		});

		var nw = new NwBuilder( options );

		nw.on( "log", grunt.log.debug );
		nw.on( "stdout", grunt.log.debug );
		nw.on( "stderr", grunt.log.debug );

		nw.build().then(function() {
			grunt.log.ok( "NW.js application created." );
			done();
		}, grunt.fail.fatal );
	});

};
