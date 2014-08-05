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
	release			: {
		options			: {
			/*
			 * Do not use dev versions for release builds
			 *
			 * Defining two versions in the config file and mapping the names for a release build
			 * doesn't seem to work here. So we need to overwrite the paths in the grunt config :(
			 * https://gist.github.com/askesian/6e05daa443ca1955ea32
			 */
			paths			: {
				"ember"			: "../vendor/ember/ember.prod",
				"ember-data"	: "../vendor/ember-data/ember-data.prod"
			}
		}
	}
};
