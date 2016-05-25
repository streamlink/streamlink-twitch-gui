module.exports = {
	options: {
		baseUrl       : "src/app",
		mainConfigFile: "src/requirejs/config.js",

		name: "",
		out : "build/tmp/app/main.js",

		include: [ "main" ],
		exclude: [ "EmberHtmlbars", "EmberHtmlbarsWrapper" ],

		findNestedDependencies: true,
		generateSourceMaps    : false,
		optimize              : "none",

		skipModuleInsertion: false,
		wrap               : false,

		skipSemiColonInsertion : true,
		useStrict              : true,
		preserveLicenseComments: true,

		map: {
			"file": {
				"file": "../requirejs/plugins/file/file.optimizer"
			},
			"json": {
				"json": "../requirejs/plugins/json/json.optimizer"
			},
			"hbs": {
				"hbs": "../requirejs/plugins/hbs/hbs.optimizer"
			}
		}
	},

	dev: {
		options: {
			generateSourceMaps: true,

			paths: {
				"file": "../requirejs/plugins/file/file.prod",
				"json": "../requirejs/plugins/json/json.prod",
				"hbs" : "../requirejs/plugins/hbs/hbs.prod"
			}
		}
	},

	release: {
		options: {
			paths: {
				"file": "../requirejs/plugins/file/file.prod",
				"json": "../requirejs/plugins/json/json.prod",
				"hbs" : "../requirejs/plugins/hbs/hbs.prod",

				"Ember"    : "../vendor/ember/ember.prod",
				"EmberData": "../vendor/ember-data/ember-data.prod"
			}
		}
	}
};
