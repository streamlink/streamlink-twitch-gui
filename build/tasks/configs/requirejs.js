module.exports = {
	options			: {
		baseUrl					: "src/app",
		mainConfigFile			: "src/app/config.js",

		name					: "",
		out						: "build/tmp/app/main.js",

		include					: [ "main" ],

		findNestedDependencies	: true,
		generateSourceMaps		: false,
		optimize				: "none",

		/*
		 * Create module definitions for all non-AMD modules!
		 */
		skipModuleInsertion		: false,
		/*
		 * Handlebars doesn't register itself to the global namespace properly... :(
		 * var Handlebars=(function(){...})()
		 * So we can't use a shim config which reads from the global namespace
		 * this.Handlebars === undefined
		 * So Handlebars and Ember will only work if we don't wrap all the code :(((
		 */
		wrap					: false,

		skipSemiColonInsertion	: true,
		useStrict				: true,
		preserveLicenseComments	: true
	},
	dev				: {
		options			: {
			generateSourceMaps	: true
		}
	},
	release			: {}
};
