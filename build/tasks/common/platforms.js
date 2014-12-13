module.exports = {
	platforms: {
		win: {
			platform: "win32",
			arch    : null
		},

		osx: {
			platform: "darwin",
			arch    : null
		},

		linux32: {
			platform: "linux",
			arch    : "x86"
		},
		linux64: {
			platform: "linux",
			arch    : "x64"
		}
	},

	getList: function() {
		return "Optional platforms: all:" + Object.keys( this.platforms ).join( ":" );
	},

	getPlatform: function( grunt, platforms ) {
		var configs = this.platforms;
		platforms = [].slice.call( platforms );

		// all platforms
		if ( platforms.length === 1 && platforms[0] === "all" ) {
			return Object.keys( configs );

		// current platform
		} else if ( platforms.length === 0 ) {
			return Object.keys( configs ).filter(function( platform ) {
				var config = configs[ platform ];
				return	config.platform === process.platform
					&&	( config.arch === null || config.arch === process.arch );
			});

		// validate given platform list
		} else if ( platforms.every(function( platform ) {
			return configs.hasOwnProperty( platform );
		}) ) {
			return platforms;
		}

		grunt.fail.fatal(
			"Invalid platforms. " +
			"Valid platforms are: all:" + Object.keys( configs ).join( ":" )
		);
	},

	getTasks: function( grunt, task, targets ) {
		return this.getPlatform( grunt, targets )
			.map(function( platform ) {
				return task + ":" + platform;
			});
	}
};
