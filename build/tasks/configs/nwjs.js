module.exports = {
	options: {
		files   : "build/tmp/prod/**",
		buildDir: "build/releases",
		cacheDir: "build/cache",
		version : "<%= grunt.config('main.nwjs-version') %>",
		flavor  : "normal",
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
