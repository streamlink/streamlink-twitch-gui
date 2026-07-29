module.exports = function( grunt ) {
	const platforms = require( "../common/platforms" );
	const { hasOwnProperty } = {};

	function taskCompile() {
		const options = this.options();
		const [ debug, targets ] = platforms.getDebugTargets( this.args );

		for ( const platform of platforms.getPlatforms( ...targets ) ) {
			if ( !hasOwnProperty.call( options, platform ) ) {
				throw new Error( `Missing compile option for platform: ${platform}` );
			}

			grunt.task.run([
				// run these tasks before the compilation
				...( options[ platform ].before || [] ),
				// the actual compile tasks
				`nwjs:${platform}${debug ? ":debug" : ""}`,
				// run these tasks after the compilation
				...( options[ platform ].after || [] )
			]);
		}
	}

	grunt.task.registerTask(
		"compile",
		`Compile the built application. ${platforms.getList()}`,
		taskCompile
	);
};
