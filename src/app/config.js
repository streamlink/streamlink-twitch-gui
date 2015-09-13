/* global requirejs */

/**
 * RequireJS Configuration
 * This will also be used as the requirejs optimization config
 */
requirejs.config({
	"shim": {
		"Ember": {
			"deps": [ "JQuery" ],
			"exports": "Ember"
		},
		"EmberData": {
			"deps": [ "Ember" ],
			"exports": "DS"
		},
		"EmberDataLS": [ "EmberData" ]
	},

	"map": {
		"*": {
			"EmberHtmlbars": "EmberHtmlbarsWrapper"
		},
		// export wrapper
		"EmberHtmlbarsWrapper": {
			"EmberHtmlbars": "EmberHtmlbars"
		}
	},

	"paths": {
		// RequireJS plugins
		"json": "../requirejs/plugins/json/json.dev",
		"hbs" : "../requirejs/plugins/hbs/hbs.dev",

		// Vendor
		"Ember"        : "../vendor/ember/ember.debug",
		"EmberHtmlbars": "../vendor/ember/ember-template-compiler",
		"EmberData"    : "../vendor/ember-data/ember-data",
		"EmberDataLS"  : "../vendor/ember-localstorage-adapter/localstorage_adapter",
		"JQuery"       : "../vendor/jquery/dist/jquery",
		"Selecter"     : "../vendor/Selecter/jquery.fs.selecter",
		"Moment"       : "../vendor/momentjs/moment",

		// Wrappers
		"EmberHtmlbarsWrapper": "../requirejs/wrappers/EmberHtmlbarsWrapper",

		// Application paths
		"root"        : "..",
		"requirejs"   : "../requirejs",
		"initializers": "initializers",
		"mixins"      : "mixins",
		"services"    : "services",
		"helpers"     : "helpers",
		"models"      : "models",
		"controllers" : "controllers",
		"routes"      : "routes",
		"components"  : "components",
		"store"       : "store",
		"utils"       : "utils",
		"gui"         : "gui",
		"templates"   : "../templates"
	}
});
