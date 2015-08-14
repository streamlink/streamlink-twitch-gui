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

	"paths": {
		// RequireJS plugins
		"text": "../vendor/requirejs-text/text",

		// Vendor
		"Ember"        : "../vendor/ember/ember.debug",
		"EmberHtmlbars": "../vendor/ember/ember-template-compiler",
		"EmberData"    : "../vendor/ember-data/ember-data",
		"EmberDataLS"  : "../vendor/ember-localstorage-adapter/localstorage_adapter",
		"JQuery"       : "../vendor/jquery/dist/jquery",
		"Selecter"     : "../vendor/Selecter/jquery.fs.selecter",
		"Moment"       : "../vendor/momentjs/moment",

		// Application paths
		"root"        : "..",
		"initializers": "initializers",
		"mixins"      : "mixins",
		"services"    : "services",
		"helpers"     : "helpers",
		"models"      : "models",
		"views"       : "views",
		"controllers" : "controllers",
		"routes"      : "routes",
		"components"  : "components",
		"store"       : "store",
		"utils"       : "utils",
		"gui"         : "gui",
		"templates"   : "../templates"
	}
});
