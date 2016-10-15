module.exports = {
	options: {
		files   : "<%= dir.tmp_prod %>/**",
		buildDir: "<%= dir.releases %>",
		cacheDir: "<%= dir.cache %>",
		version : "<%= main['nwjs-version'] %>",
		winIco  : "<%= dir.resources %>/icons/icon-16-32-48-256.ico",
		macIcns : "<%= dir.resources %>/icons/icon-1024.icns",
		macPlist: {
			CFBundleName       : "<%= main['display-name'] %>",
			CFBundleDisplayName: "<%= main['display-name'] %>",
			LSEnvironment      : {
				PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
			}
		}
	},

	win32: {
		options: { platforms: [ "win32" ] }
	},
	win64: {
		options: { platforms: [ "win64" ] }
	},

	osx32: {
		options: { platforms: [ "osx32" ] }
	},
	osx64: {
		options: { platforms: [ "osx64" ] }
	},

	linux32: {
		options: { platforms: [ "linux32" ] }
	},
	linux64: {
		options: { platforms: [ "linux64" ] }
	}
};
