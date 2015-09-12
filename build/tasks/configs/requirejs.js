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
		preserveLicenseComments: true,

		map: {
			"json": {
				"json": "../requirejs/plugins/json/json.optimizer"
			}
		}
	},

	dev: {
		options: {
			generateSourceMaps: true,

			paths: {
				"json"     : "../requirejs/plugins/json/json.prod"
			}
		}
	},

	release: {
		options: {
			paths: {
				"json"     : "../requirejs/plugins/json/json.prod",

				"Ember"    : "../vendor/ember/ember.prod",
				"EmberData": "../vendor/ember-data/ember-data.prod"
			}
		}
	}
};
