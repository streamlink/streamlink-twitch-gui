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
			"Ember": "EmberWrapper",
			"EmberHtmlbars": "EmberHtmlbarsWrapper"
		},
		// fixes ember 1.13.x on NW.js
		"EmberWrapper": {
			"Ember": "Ember",
			"EmberHtmlbars": "EmberHtmlbars"
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
		"EmberWrapper"        : "../requirejs/wrappers/EmberWrapper.dev",
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


// See EmberWrapper
// reassign process property after loading Ember
window._process = window.process;
window.process = null;
