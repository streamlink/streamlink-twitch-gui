module.exports = {
	platforms: {
		win32: {
			platform: "win32",
			arch    : "ia32"
		},
		win64: {
			platform: "win32",
			arch    : "x64"
		},

		osx64: {
			platform: "darwin",
			arch    : "x64"
		},

		linux32: {
			platform: "linux",
			arch    : "ia32"
		},
		linux64: {
			platform: "linux",
			arch    : "x64"
		}
	},

	filters: {
		win( str )   { return   /^win\d+$/.test( str ); },
		osx( str )   { return   /^osx\d+$/.test( str ); },
		linux( str ) { return /^linux\d+$/.test( str ); },
		x86( str )   { return    /^\D+32$/.test( str ); },
		x64( str )   { return    /^\D+64$/.test( str ); }
	},

	getList() {
		const list = Object.keys( this.platforms ).join( ":" );

		return `Optional platforms: all:x86:x64:${list}`;
	},

	/**
	 * @param {String[]} [platforms]
	 * @returns {String[]}
	 */
	getPlatforms( platforms ) {
		const { platforms: configs, filters } = this;
		platforms = [ ...( platforms || [] ) ];

		// all platforms or platforms by arch
		if ( platforms.length === 1 ) {
			const keys = Object.keys( configs );
			let res;

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
				case "ia32":
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
			return Object.keys( configs ).filter( platform => {
				const config = configs[ platform ];

				return config.platform === process.platform
				    && ( config.arch === null || config.arch === process.arch );
			});

		// validate given platform list
		} else if ( platforms.every( configs.hasOwnProperty.bind( configs ) ) ) {
			return platforms;
		}

		const list = Object.keys( configs ).join( ":" );

		throw new Error( `Invalid platforms. Valid platforms are: all:${list}` );
	},

	/**
	 * @param {string} task
	 * @param {string[]} targets
	 * @returns {string[]}
	 */
	getTasks( task, targets ) {
		return this.getPlatforms( targets )
			.map( platform => `${task}:${platform}` );
	}
};
