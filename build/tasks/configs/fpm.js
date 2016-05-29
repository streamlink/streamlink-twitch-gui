module.exports = {
	options: {
		s: "dir",
		force: true,

		version: "<%= package.version %>",
		iteration: process.env.PACKAGE_ITERATION || "1",
		name: "<%= package.name %>",
		description: [
			"A graphical user interface on top of the Streamlink command line interface.",
			"Browse Twitch.tv and watch streams in your videoplayer of choice."
		].join( "\n" ),
		url: "<%= package.homepage %>",
		license: "<%= package.license %>",
		maintainer: [
			process.env.PACKAGE_MAINTAINER_NAME,
			"<" + process.env.PACKAGE_MAINTAINER_EMAIL + ">"
		].join( " " ),
		vendor: "",

		prefix: "/opt/<%= fpm.options.name %>",
		"template-scripts": true
	},

	deb32: {
		options: {
			t: "deb",
			a: "i386",
			C: "<%= dir.releases %>/<%= package.name %>/linux32",
			p: [
				"<%= dir.dist %>/",
				"<%= package.name %>",
				"_<%= package.version %>",
				"-<%= fpm.options.iteration %>",
				"_<%= fpm.deb32.options.a %>",
				".<%= fpm.deb32.options.t %>"
			].join( "" ),

			depends: [
				"xdg-utils"
			],

			"template-value": {
				"prefix": "<%= fpm.options.prefix %>",
				"exec": "<%= package.name %>"
			},
			"after-install": "<%= dir.resources %>/package/deb/postinst",
			"before-remove": "<%= dir.resources %>/package/deb/prerm",
			"after-remove": "<%= dir.resources %>/package/deb/postrm",

			/*
			// does not work: lintian is complaining. may be a bug in fpm v1.6.0
			"deb-meta-file": [
				"<%= dir.resources %>/package/deb/copyright"
			],
			*/

			"deb-compression": "xz",
			"deb-no-default-config-files": true
		}
	},

	deb64: {
		options: {
			t: "deb",
			a: "amd64",
			C: "<%= dir.releases %>/<%= package.name %>/linux64",
			p: [
				"<%= dir.dist %>/",
				"<%= package.name %>",
				"_<%= package.version %>",
				"-<%= fpm.options.iteration %>",
				"_<%= fpm.deb64.options.a %>",
				".<%= fpm.deb64.options.t %>"
			].join( "" ),

			depends: [
				"xdg-utils"
			],

			"template-value": {
				"prefix": "<%= fpm.options.prefix %>",
				"exec": "<%= package.name %>"
			},
			"after-install": "<%= dir.resources %>/package/deb/postinst",
			"before-remove": "<%= dir.resources %>/package/deb/prerm",
			"after-remove": "<%= dir.resources %>/package/deb/postrm",

			/*
			// does not work: lintian is complaining. may be a bug in fpm v1.6.0
			"deb-meta-file": [
				"<%= dir.resources %>/package/deb/copyright"
			],
			*/

			"deb-compression": "xz",
			"deb-no-default-config-files": true
		}
	}
};
