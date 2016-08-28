var files = [
	"build/tmp/prod/**"
];

var filesWin32 = files.concat(
	"!build/tmp/prod/bin/darwin/**",
	"!build/tmp/prod/bin/linux/**"
);
var filesDarwin = files.concat(
	"!build/tmp/prod/bin/win32/**",
	"!build/tmp/prod/bin/linux/**"
);
var filesLinux = files.concat(
	"!build/tmp/prod/bin/win32/**",
	"!build/tmp/prod/bin/darwin/**"
);


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
			files: filesWin32,
			platforms: [ "win64" ]
		}
	},

	osx32: {
		options: {
			files: filesDarwin,
			platforms: [ "osx32" ]
		}
	},
	osx64: {
		options: {
			files: filesDarwin,
			platforms: [ "osx64" ]
		}
	},

	linux32: {
		options: {
			files: filesLinux,
			platforms: [ "linux32" ]
		}
	},
	linux64: {
		options: {
			files: filesLinux,
			platforms: [ "linux64" ]
		}
	}
};
