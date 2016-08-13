var platforms = require( "../common/platforms" );
var tasks = require( "../configs/compile" );


module.exports = function( grunt ) {
	var task  = "compile";
	var descr = "Compile the built project. " + platforms.getList();

	grunt.task.registerTask( task, descr, function() {
		platforms.getPlatforms( arguments )
			.forEach(function( platform ) {
				grunt.task.run( []
					// run these tasks before the compilation
					.concat( tasks[ platform ].before || [] )
					// the actual compile tasks
					.concat([ "nwjs:" + platform ])
					// run these tasks after the compilation
					.concat( tasks[ platform ].after || [] )
				);
			});
	});

};
