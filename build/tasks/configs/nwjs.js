const files = [
	"<%= dir.tmp_prod %>/**"
];
const ignoreBinWin32 = "!<%= dir.tmp_prod %>/bin/win32/**";
const ignoreBinWin64 = "!<%= dir.tmp_prod %>/bin/win64/**";


module.exports = {
	options: {
		files,
		buildDir: "<%= dir.releases %>",
		cacheDir: "<%= dir.cache %>",
		flavor  : "normal",
		zip     : false,
		winIco  : "<%= dir.resources %>/icons/icon-16-32-48-256.ico",
		macIcns : "<%= dir.resources %>/icons/icon-1024.icns",
		macPlist: {
			CFBundleIdentifier : "<%= main['app-identifier'] %>",
			CFBundleName       : "<%= main['display-name'] %>",
			CFBundleDisplayName: "<%= main['display-name'] %>",
			LSEnvironment      : {
				PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
			}
		}
	},

	win32: {
		options: {
			platforms: [ "win32" ],
			version: "0.82.0",
			files: [
				...files,
				ignoreBinWin64
			]
		}
	},
	win64: {
		options: {
			platforms: [ "win64" ],
			version: "0.82.0",
			files: [
				...files,
				ignoreBinWin32
			]
		}
	},

	osx64: {
		options: {
			platforms: [ "osx64" ],
			version: "0.87.0",
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			]
		}
	},

	linux32: {
		options: {
			platforms: [ "linux32" ],
			version: "0.80.0",
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			]
		}
	},
	linux64: {
		options: {
			platforms: [ "linux64" ],
			version: "0.80.0",
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			]
		}
	}
};
