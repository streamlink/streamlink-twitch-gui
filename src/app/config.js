/* global requirejs */

/**
 * RequireJS Configuration
 * This will also be used as the requirejs optimization config
 */
requirejs.config({
	// Wrap shimmed dependencies in a define() wrapper...
	// Needed because of Handlebars and Ember...
	"wrapShim": true,

	"shim": {
		"ember": {
			"deps": [ "handlebars", "jquery" ],
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
			"handlebars": "handlebars-wrapper"
		},
		"handlebars-wrapper": {
			"handlebars": "handlebars"
		}
	},

	"paths": {
		// RequireJS plugins
		"text"			: "../vendor/requirejs-text/text",

		// Vendor
		"ember"			: "../vendor/ember/ember",
		"ember-data"	: "../vendor/ember-data/ember-data",
		"ember-data-ls"	: "../vendor/ember-localstorage-adapter/localstorage_adapter",
		"handlebars"	: "../vendor/handlebars/handlebars",
		"jquery"		: "../vendor/jquery/dist/jquery",
		"Selecter"		: "../vendor/Selecter/jquery.fs.selecter",
		"moment"		: "../vendor/momentjs/moment",

		// App
		"App"			: "app",
		"Router"		: "router",

		// Ember paths
		"root"			: "..",
		"initializers"	: "initializers",
		"models"		: "models",
		"views"			: "views",
		"controllers"	: "controllers",
		"routes"		: "routes",
		"components"	: "components",
		"store"			: "store",
		"utils"			: "utils",
		"gui"			: "gui",
		"templates"		: "../templates"
	}
});


/**
 * Handlebars wrapper module
 * This wrapper is needed because of Ember's own module loader.
 * Now, that Handlebars 2.0.0 is properly using the amd module registration, we also need
 * to register Handlebars to the global namespace, so Ember can find it.
 * This can't be done in the shim-config by using the "exports" property or the "init" callback,
 * because those do not work for proper amd modules... See here:
 * requirejs.org/docs/api.html#config-shim
 * github.com/components/handlebars.js/blob/v2.0.0/handlebars.js#L30
 * github.com/emberjs/ember.js/blob/v1.8.1/packages/ember-handlebars-compiler/lib/main.js#L30
 */
define( "handlebars-wrapper", [ "handlebars" ], function( Handlebars ) {
	return this.Handlebars = Handlebars;
});
