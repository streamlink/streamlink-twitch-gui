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
		version : "<%= main['nwjs-version'] %>",
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
			files: [
				...files,
				ignoreBinWin64
			],
			platforms: [ "win32" ]
		}
	},
	win64: {
		options: {
			files: [
				...files,
				ignoreBinWin32
			],
			platforms: [ "win64" ]
		}
	},

	osx64: {
		options: {
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			],
			platforms: [ "osx64" ]
		}
	},

	linux32: {
		options: {
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			],
			platforms: [ "linux32" ]
		}
	},
	linux64: {
		options: {
			files: [
				...files,
				ignoreBinWin32,
				ignoreBinWin64
			],
			platforms: [ "linux64" ]
		}
	}
};
