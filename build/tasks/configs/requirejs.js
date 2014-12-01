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

		skipModuleInsertion		: false,
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
