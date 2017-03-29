const files = [
	"build/tmp/prod/**"
];

const filesWin32 = [
	...files,
	"!build/tmp/prod/bin/win64/**"
];
const filesWin64 = [
	...files,
	"!build/tmp/prod/bin/win32/**"
];
const filesMacOS = [
	...files,
	"!build/tmp/prod/bin/win32/**",
	"!build/tmp/prod/bin/win64/**"
];
const filesLinux32 = [
	...files,
	"!build/tmp/prod/bin/win32/**",
	"!build/tmp/prod/bin/win64/**"
];
const filesLinux64 = [
	...files,
	"!build/tmp/prod/bin/win32/**",
	"!build/tmp/prod/bin/win64/**"
];


module.exports = {
	options: {
		files   : "<%= dir.tmp_prod %>/**",
		buildDir: "<%= dir.releases %>",
		cacheDir: "<%= dir.cache %>",
		version : "<%= main['nwjs-version'] %>",
		flavor  : "normal",
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
			files: filesWin32,
			platforms: [ "win32" ]
		}
	},
	win64: {
		options: {
			files: filesWin64,
			platforms: [ "win64" ]
		}
	},

	osx64: {
		options: {
			files: filesMacOS,
			platforms: [ "osx64" ]
		}
	},

	linux32: {
		options: {
			files: filesLinux32,
			platforms: [ "linux32" ]
		}
	},
	linux64: {
		options: {
			files: filesLinux64,
			platforms: [ "linux64" ]
		}
	}
};
