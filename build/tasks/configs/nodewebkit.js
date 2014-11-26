module.exports = {
	options			: {
		buildDir		: "build/releases",
		cacheDir		: "build/cache",
		version			: "<%= package.config['node-webkit-version'] %>"
	},
	win				: {
		options			: {
			win				: true,
			winIco			: "build/resources/icons/icon-16-32-48-256.ico"
		},
		src				: "build/tmp/**"
	},
	osx				: {
		options			: {
			osx				: true,
			macIcns			: "build/resources/icons/icon-512.icns",
			macPlist		: {
				CFBundleName		: "<%= package.config['display-name'] %>",
				CFBundleDisplayName	: "<%= package.config['display-name'] %>",
				LSEnvironment		: {
					PATH				: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
				}
			}
		},
		src				: "build/tmp/**"
	},
	linux32			: {
		options			: {
			linux32			: true
		},
		src				: "build/tmp/**"
	},
	linux64			: {
		options			: {
			linux64			: true
		},
		src				: "build/tmp/**"
	}
};
