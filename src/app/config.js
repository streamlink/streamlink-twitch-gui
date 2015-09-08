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
			"Ember": "EmberShim"
		},
		"EmberShim": {
			"Ember": "Ember"
		}
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
		"controllers" : "controllers",
		"routes"      : "routes",
		"components"  : "components",
		"store"       : "store",
		"utils"       : "utils",
		"gui"         : "gui",
		"templates"   : "../templates"
	}
});


// fix ember 1.13.x
// https://github.com/emberjs/ember.js/issues/11679
// reassign process property after loading ember
window._process = window.process;
window.process = null;

define( "EmberShim", [ "Ember", "EmberHtmlbars" ], function( Ember ) {
	// fix ember 1.13.x
	// https://github.com/emberjs/ember.js/issues/11679
	window.process = window._process;
	delete window._process;

	return Ember;
});
