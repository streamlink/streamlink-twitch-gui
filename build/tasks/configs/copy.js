module.exports = {
	build			: {
		expand			: true,
		cwd				: "src",
		src				: [
			"package.json",
			"index.html",
			"vendor/requirejs/require.js",
			"fonts/*.woff",
			"vendor/font-awesome/fonts/*.woff",
			"img/**"
		],
		dest			: "build/tmp"
	},
	linux32scripts	: {
		options			: { mode: 493 }, // 0755 (js strict mode)
		expand			: true,
		flatten			: true,
		src				: "build/resources/linux/*.sh",
		dest			: "build/releases/<%= package.name %>/linux32/<%= package.name %>/"
	},
	linux64scripts	: {
		options			: { mode: 493 }, // 0755 (js strict mode)
		expand			: true,
		flatten			: true,
		src				: "build/resources/linux/*.sh",
		dest			: "build/releases/<%= package.name %>/linux64/<%= package.name %>/"
	},
	linux32icons	: {
		expand			: true,
		flatten			: true,
		src				: "build/resources/icons/*.png",
		dest			: "build/releases/<%= package.name %>/linux32/<%= package.name %>/icons/"
	},
	linux64icons	: {
		expand			: true,
		flatten			: true,
		src				: "build/resources/icons/*.png",
		dest			: "build/releases/<%= package.name %>/linux64/<%= package.name %>/icons/"
	}
};
