module.exports = {
	options: {
		baseUrl       : "src/app",
		mainConfigFile: "src/app/config.js",

		name: "",
		out : "build/tmp/app/main.js",

		include: [ "main" ],

		findNestedDependencies: true,
		generateSourceMaps    : false,
		optimize              : "none",

		skipModuleInsertion: false,
		wrap               : false,

		skipSemiColonInsertion : true,
		useStrict              : true,
		preserveLicenseComments: true
	},

	dev: {
		options: {
			generateSourceMaps: true
		}
	},

	release: {
		options: {
			paths: {
				"Ember"    : "../vendor/ember/ember.prod",
				"EmberData": "../vendor/ember-data/ember-data.prod"
			}
		}
	}
};
