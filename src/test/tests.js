define(function( require ) {

	// load requirejs app-config
	require( [ "../app/config" ], function() {

		// adjust paths to the test environment
		requirejs.config({
			"paths": {
				"test"			: "./tests",

				// App
				"App"			: "../app/app",
				"Router"		: "../app/router",

				// Ember paths
				"models"		: "../app/models",
				"views"			: "../app/views",
				"controllers"	: "../app/controllers",
				"routes"		: "../app/routes",
				"components"	: "../app/components",
				"store"			: "../app/store",
				"utils"			: "../app/utils",
				"gui"			: "../app/gui",
				"templates"		: "../templates"
			}
		});

		// then load tests and start QUnit
		require(
			[
				"test/semver"
			],
			QUnit.start
		);

	});

});
