module.exports = {
	options: {
		buildDir: "build/releases",
		cacheDir: "build/cache",
		version : "<%= package.config['nw-js-version'] %>",
		winIco  : "build/resources/icons/icon-16-32-48-256.ico",
		macIcns : "build/resources/icons/icon-1024.icns",
		macPlist: {
			CFBundleName       : "<%= package.config['display-name'] %>",
			CFBundleDisplayName: "<%= package.config['display-name'] %>",
			LSEnvironment      : {
				PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
			}
		}
	},

	win32: {
		options: { win32: true },
		src    : "build/tmp/**"
	},
	win64: {
		options: { win64: true },
		src    : "build/tmp/**"
	},

	osx32: {
		options: { osx32: true },
		src    : "build/tmp/**"
	},
	osx64: {
		options: { osx64: true },
		src    : "build/tmp/**"
	},

	linux32: {
		options: { linux32: true },
		src    : "build/tmp/**"
	},
	linux64: {
		options: { linux64: true },
		src    : "build/tmp/**"
	}
};
