module.exports = function( grunt ) {
	"use strict";

	var nwBuilder = require( "../common/nwjs" );

	var task  = "run";
	var descr = "Run NW.js";

	grunt.task.registerMultiTask( task, descr, function() {
		var done    = this.async();
		var options = this.options();

		var nw = nwBuilder( grunt, this.data.src, options );

		nw.on( "log", grunt.log.writeln );
		nw.on( "stdout", grunt.log.debug );
		nw.on( "stderr", grunt.log.debug );

		nw.run().then( done, grunt.fail.fatal );
	});
};
