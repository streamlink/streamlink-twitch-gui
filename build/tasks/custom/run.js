var PATH      = require( "path" );
var NwBuilder = require( "nw-builder" );
var platforms = require( "../common/platforms" );


module.exports = function( grunt ) {
	var task  = "run";
	var descr = "Run NW.js";

	grunt.task.registerMultiTask( task, descr, function() {
		var done    = this.async();
		var options = this.options({
			platforms: platforms.getPlatforms( [] )
		});

		options.files = PATH.resolve( process.cwd(), this.data.src );

		var nw = new NwBuilder( options );

		nw.on( "log", grunt.log.writeln );
		nw.on( "stdout", grunt.log.debug );
		nw.on( "stderr", grunt.log.debug );

		nw.run().then( done, grunt.fail.fatal );
	});
};
