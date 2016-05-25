module.exports = {
	options: {
		buildDir: "build/releases",
		cacheDir: "build/cache",
		version : "<%= grunt.config('main.nwjs-version') %>",
		winIco  : "build/resources/icons/icon-16-32-48-256.ico",
		macIcns : "build/resources/icons/icon-1024.icns",
		macPlist: {
			CFBundleName       : "<%= grunt.config('main.display-name') %>",
			CFBundleDisplayName: "<%= grunt.config('main.display-name') %>",
			LSEnvironment      : {
				PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
			}
		}
	},

	win32: {
		options: { platforms: [ "win32" ] },
		src    : "build/tmp/**"
	},
	win64: {
		options: { platforms: [ "win64" ] },
		src    : "build/tmp/**"
	},

	osx32: {
		options: { platforms: [ "osx32" ] },
		src    : "build/tmp/**"
	},
	osx64: {
		options: { platforms: [ "osx64" ] },
		src    : "build/tmp/**"
	},

	linux32: {
		options: { platforms: [ "linux32" ] },
		src    : "build/tmp/**"
	},
	linux64: {
		options: { platforms: [ "linux64" ] },
		src    : "build/tmp/**"
	}
};
