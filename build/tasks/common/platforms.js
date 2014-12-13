module.exports = {
	platforms: {
		win32: {
			platform: "win32",
			arch    : "x86"
		},
		win64: {
			platform: "win32",
			arch    : "x64"
		},

		osx32: {
			platform: "darwin",
			arch    : "x86"
		},
		osx64: {
			platform: "darwin",
			arch    : "x64"
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

	filters: {
		win  : function( str ) { return   /^win\d+$/.test( str ); },
		osx  : function( str ) { return   /^osx\d+$/.test( str ); },
		linux: function( str ) { return /^linux\d+$/.test( str ); },
		x86  : function( str ) { return    /^\D+32$/.test( str ); },
		x64  : function( str ) { return    /^\D+64$/.test( str ); }
	},

	getList: function() {
		return "Optional platforms: all:x86:x64:" + Object.keys( this.platforms ).join( ":" );
	},

	getPlatform: function( grunt, platforms ) {
		var configs = this.platforms,
		    filters = this.filters;
		platforms = [].slice.call( platforms );

		// all platforms or platforms by arch
		if ( platforms.length === 1 ) {
			var keys = Object.keys( configs ),
			    res;
			switch ( platforms[0] ) {
				case "all":
					return keys;

				case "win":
				case "windows":
					res = keys.filter( filters.win );
					if ( res.length ) { return res; }
					break;

				case "osx":
				case "mac":
					res = keys.filter( filters.osx );
					if ( res.length ) { return res; }
					break;

				case "linux":
					res = keys.filter( filters.linux );
					if ( res.length ) { return res; }
					break;

				case "32":
				case "x86":
					res = keys.filter( filters.x86 );
					if ( res.length ) { return res; }
					break;

				case "64":
				case "x64":
					res = keys.filter( filters.x64 );
					if ( res.length ) { return res; }
					break;

				default:
					if ( configs.hasOwnProperty( platforms[0] ) ) { return platforms; }
			}

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
