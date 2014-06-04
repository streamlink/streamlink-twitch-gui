module.exports = {
	options			: {
		compress			: {
			global_defs			: {
				DEBUG				: false
			}
		},
		mangle				: true,
		beautify			: false,
		preserveComments	: "some",

		report				: "min",
		banner				: [
			"/*!",
			" * <%= package.name %>",
			" * @version v<%= package.version %>",
			" * @date <%= grunt.template.today('yyyy-mm-dd') %>",
			" * @copyright <%= package.author %>",
			" */"
		].join( "\n" )
	},
	release			: {
		// overwrite input file
		src				: "build/tmp/app/main.js",
		dest			: "build/tmp/app/main.js"
	}
};
