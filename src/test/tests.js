define(function( require ) {

	// load requirejs app-config
	require( [ "../app/config" ], function() {

		// adjust paths to the test environment
		requirejs.config({
			"paths": {
				// Test paths
				"test": "./tests",

				// Application paths
				"root"        : "..",
				"initializers": "../app/initializers",
				"mixins"      : "../app/mixins",
				"services"    : "../app/services",
				"models"      : "../app/models",
				"views"       : "../app/views",
				"controllers" : "../app/controllers",
				"routes"      : "../app/routes",
				"components"  : "../app/components",
				"store"       : "../app/store",
				"utils"       : "../app/utils",
				"gui"         : "../app/gui",
				"templates"   : "../templates"
			}
		});


		require( [ "text!./tests.json" ], function( tests ) {
			tests = JSON.parse( tests ).tests;

			// then load tests and start QUnit
			require( tests, QUnit.start );
		});

	});

});
