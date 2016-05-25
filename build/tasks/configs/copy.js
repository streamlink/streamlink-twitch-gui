module.exports = {
	build: {
		expand: true,
		dest  : "build/tmp",
		cwd   : "src",
		src   : [
			"package.json",
			"index.html",
			"oauth.{html,json}",
			"vendor/requirejs/require.js",
			"vendor/roboto-fontface/fonts/Roboto-{Light,Regular,Medium,Bold,RegularItalic}.woff2",
			"vendor/font-awesome/fonts/*.woff2",
			"img/**"
		]
	},

	win32scripts: {
		expand : true,
		flatten: true,
		src    : "build/resources/windows/*",
		dest   : "build/releases/<%= package.name %>/win32/"
	},
	win64scripts: {
		expand : true,
		flatten: true,
		src    : "build/resources/windows/*",
		dest   : "build/releases/<%= package.name %>/win64/"
	},

	linux32scripts: {
		options: { mode: 493 }, // 0755 (js strict mode)
		expand : true,
		flatten: true,
		src    : "build/resources/linux/*.sh",
		dest   : "build/releases/<%= package.name %>/linux32/"
	},
	linux64scripts: {
		options: { mode: 493 }, // 0755 (js strict mode)
		expand : true,
		flatten: true,
		src    : "build/resources/linux/*.sh",
		dest   : "build/releases/<%= package.name %>/linux64/"
	},

	linux32icons: {
		expand : true,
		flatten: true,
		src    : "build/resources/icons/*.png",
		dest   : "build/releases/<%= package.name %>/linux32/icons/"
	},
	linux64icons: {
		expand : true,
		flatten: true,
		src    : "build/resources/icons/*.png",
		dest   : "build/releases/<%= package.name %>/linux64/icons/"
	}
};
