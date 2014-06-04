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
	linux32start	: {
		options			: { mode: 493 }, // 0755 (js strict mode)
		src				: "build/script/start.sh",
		dest			: "build/releases/<%= package.name %>/linux32/<%= package.name %>/start.sh"
	},
	linux64start	: {
		options			: { mode: 493 }, // 0755 (js strict mode)
		src				: "build/script/start.sh",
		dest			: "build/releases/<%= package.name %>/linux64/<%= package.name %>/start.sh"
	}
};
