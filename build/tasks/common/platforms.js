// maps this project's own platform identifiers (which mirror Node's
// process.platform) to the platform identifiers used by nw-builder
const nwBuildPlatforms = {
	win32 : "win",
	darwin: "osx",
	linux : "linux"
};


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

	/**
	 * Get the `platform` and `arch` values expected by nw-builder for one of
	 * this project's own platform identifiers (eg. "win32", "linux64", ...).
	 */
	getNwBuildTarget( name ) {
		const { platform, arch } = this.platforms[ name ];

		return {
			platform: nwBuildPlatforms[ platform ],
			arch
		};
	},

	getList() {
		const list = Object.keys( this.platforms ).join( ":" );

		return `Supported platforms: all:${list}`;
	},

	getPlatform() {
		for ( let [ name, { platform, arch } ] of Object.entries( this.platforms ) ) {
			if ( platform === process.platform && arch === process.arch ) {
				return name;
			}
		}

		throw new Error( `Unsupported platform: ${process.platform} (${process.arch})` );
	},

	getPlatforms( ...args ) {
		if ( !args.length ) {
			return [ this.getPlatform() ];
		}

		const { platforms } = this;
		const { hasOwnProperty } = {};
		const arr = [];

		for ( let platform of args ) {
			if ( platform === "all" ) {
				arr.push( ...Object.keys( platforms ) );
			} else if ( hasOwnProperty.call( platforms, platform ) ) {
				arr.push( platform );
			} else {
				throw new Error( `Invalid platform: ${platform}` );
			}
		}

		return Array.from( new Set( arr ) );
	},

	getDebugTargets( targets ) {
		return targets.length && targets[ targets.length - 1 ] === "debug"
			? [ true, targets.slice( 0, -1 ) ]
			: [ false, targets.slice() ];
	}
};
