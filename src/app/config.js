/* global requirejs */

/**
 * RequireJS Configuration
 * This will also be used as the requirejs optimization config
 */
requirejs.config({
	"shim": {
		"app": [ "ember", "ember-data", "ember-data-ls" ],
		"ember": {
			"deps": [ "ember-htmlbars", "jquery" ],
			"exports": "Ember"
		},
		"ember-data": {
			"deps": [ "ember" ],
			"exports": "DS"
		},
		"ember-data-ls": [ "ember-data" ]
	},

	"map": {
		"*": {
			"nwGui"     : "nwjs/nwGui",
			"nwWindow"  : "nwjs/nwWindow"
		}
	},

	"paths": {
		// RequireJS plugins
		"text": "../vendor/requirejs-text/text",

		// Vendor
		"ember"         : "../vendor/ember/ember.debug",
		"ember-htmlbars": "../vendor/ember/ember-template-compiler",
		"ember-data"    : "../vendor/ember-data/ember-data",
		"ember-data-ls" : "../vendor/ember-localstorage-adapter/localstorage_adapter",
		"jquery"        : "../vendor/jquery/dist/jquery",
		"Selecter"      : "../vendor/Selecter/jquery.fs.selecter",
		"moment"        : "../vendor/momentjs/moment",

		// Application paths
		"root"        : "..",
		"initializers": "initializers",
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
