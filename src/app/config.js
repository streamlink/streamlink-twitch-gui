/* global requirejs */

/**
 * RequireJS Configuration
 * This will also be used as the requirejs optimization config
 */
requirejs.config({
	"shim": {
		"App": [ "ember", "ember-data", "ember-data-ls" ],

		"handlebars": {
			"deps": [],
			"exports": "Handlebars"
		},
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
