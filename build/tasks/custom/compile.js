const platforms = require( "../common/platforms" );
const tasks = require( "../configs/compile" );


module.exports = function( grunt ) {
	const task = "compile";
	const descr = `Compile the built application. ${platforms.getList()}`;

	grunt.task.registerTask( task, descr, function() {
		platforms.getPlatforms( arguments )
			.forEach( platform => {
				grunt.task.run([
					// run these tasks before the compilation
					...( tasks[ platform ].before || [] ),
					// the actual compile tasks
					`nwjs:${platform}`,
					// run these tasks after the compilation
					...( tasks[ platform ].after || [] )
				]);
			});
	});

};
