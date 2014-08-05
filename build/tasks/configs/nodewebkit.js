module.exports = {
	options			: {
		buildDir		: "build/releases",
		cacheDir		: "build/cache",
		version			: "<%= package.config['node-webkit-version'] %>"
	},
	win				: {
		options			: { win: true },
		src				: "build/tmp/**"
	},
	osx				: {
		options			: { osx: true, macIcns: "build/resources/icons/icon-512.icns" },
		src				: "build/tmp/**"
	},
	linux32			: {
		options			: { linux32: true },
		src				: "build/tmp/**"
	},
	linux64			: {
		options			: { linux64: true },
		src				: "build/tmp/**"
	}
};
