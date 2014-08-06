module.exports = function( grunt ) {
	"use strict";

	var	platforms = require( "../common/platforms" ),
		tasks = {
			win		: {
				before	: [ "clean:release_win" ]
			},
			osx		: {
				before	: [ "clean:release_osx" ]
			},
			linux32	: {
				before	: [ "clean:release_linux32" ],
				after	: [ "copy:linux32scripts", "copy:linux32icons" ]
			},
			linux64	: {
				before	: [ "clean:release_linux64" ],
				after	: [ "copy:linux64scripts", "copy:linux64icons" ]
			}
		};

	grunt.task.registerTask(
		"compile",
		"Compile the built project. " + platforms.getList(),
		function() {
			platforms.getPlatform( grunt, arguments )
				.forEach(function( platform ) {
					grunt.task.run( []
						// run these tasks before the compilation
						.concat( tasks[ platform ].before || [] )
						// the actual compile tasks
						.concat([ "nodewebkit:" + platform ])
						// run these tasks after the compilation
						.concat( tasks[ platform ].after || [] )
					);
				});
		}
	);

};
