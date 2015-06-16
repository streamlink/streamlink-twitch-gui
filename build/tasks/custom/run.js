module.exports = function( grunt ) {
	"use strict";

	var nwBuilder = require( "../common/nwjs" );

	var task  = "run";
	var descr = "Run NW.js";

	grunt.task.registerMultiTask( task, descr, function() {
		var done    = this.async();
		var options = this.options();

		nwBuilder( grunt, this.data.src, options )
			.run()
			.then( done, grunt.fail.fatal );
	});
};
