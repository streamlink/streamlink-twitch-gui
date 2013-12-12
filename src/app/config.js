/* global requirejs */

/**
 * RequireJS Configuration
 * This will also be used as the requirejs optimization config
 */
requirejs.config({
	"shim": {
		"handlebars": {
			"deps": [],
			"exports": "Handlebars"
		},
		"ember": {
			"deps": [ "handlebars", "jquery" ],
			"exports": "Ember"
		}
	},

	"paths": {
		// RequireJS plugins
		"text"			: "../vendor/requirejs-text/text",

		// Vendor
		"ember"			: "../vendor/ember/ember",
		"handlebars"	: "../vendor/handlebars/handlebars",
		"jquery"		: "../vendor/jquery/jquery",
		"moment"		: "../vendor/momentjs/moment",

		// App
		"App"			: "app",

		// Ember paths
		"models"		: "models",
		"views"			: "views",
		"controllers"	: "controllers",
		"router"		: "router",
		"routes"		: "routes",
		"components"	: "components",
		"utils"			: "utils",
		"gui"			: "gui",
		"templates"		: "../templates"
	}
});
