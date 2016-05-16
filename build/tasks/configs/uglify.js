module.exports = {
	options: {
		compress: {
			global_defs: {
				DEBUG: false
			}
		},

		mangle          : {},
		beautify        : false,
		screwIE8        : true,
		// https://github.com/gruntjs/grunt-contrib-uglify/issues/392
		preserveComments: /(?:^!|@(?:license|preserve|cc_on))/,

		report: "min"
	},

	release: {
		options: {
			banner: [
				"/*!",
				" * <%= package.name %>",
				" * @version v<%= package.version %>",
				" * @date <%= grunt.template.today('yyyy-mm-dd') %>",
				" * @copyright <%= package.author %>",
				" */"
			].join( "\n" )
		},

		// overwrite input file
		src    : "build/tmp/app/main.js",
		dest   : "build/tmp/app/main.js"
	},

	requirejs: {
		// overwrite input file
		src : "build/tmp/vendor/requirejs/require.js",
		dest: "build/tmp/vendor/requirejs/require.js"
	}
};
