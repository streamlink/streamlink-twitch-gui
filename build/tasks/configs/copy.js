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
	},
	flags			: {
		expand			: true,
		cwd				: "src",
		src				: "vendor/flag-icon-css/flags/4x3/"
		                + "{<%= copy.flags.getFlags( package.config.language_codes ) %>}.svg",
		dest			: "build/tmp",
		"getFlags"		: function getFlags( config ) {
			return Object.keys( config )
				.reduce(function( flags, lang ) {
					flags.push( config[ lang ][ "flag" ] );
					return flags;
				}, [] )
				.join( "," );
		}
	}
};
