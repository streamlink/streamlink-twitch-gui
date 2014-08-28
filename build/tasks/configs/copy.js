module.exports = {
	build			: {
		expand			: true,
		cwd				: "src",
		src				: [
			"package.json",
			"index.html",
			"oauth.{html,json}",
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
		dest			: "build/releases/<%= package.name %>/linux32/"
	},
	linux64scripts	: {
		options			: { mode: 493 }, // 0755 (js strict mode)
		expand			: true,
		flatten			: true,
		src				: "build/resources/linux/*.sh",
		dest			: "build/releases/<%= package.name %>/linux64/"
	},
	linux32icons	: {
		expand			: true,
		flatten			: true,
		src				: "build/resources/icons/*.png",
		dest			: "build/releases/<%= package.name %>/linux32/icons/"
	},
	linux64icons	: {
		expand			: true,
		flatten			: true,
		src				: "build/resources/icons/*.png",
		dest			: "build/releases/<%= package.name %>/linux64/icons/"
	}
};
