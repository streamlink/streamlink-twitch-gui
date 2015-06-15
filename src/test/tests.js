define(function( require ) {

	// load requirejs app-config
	require( [ "../app/config" ], function() {

		// adjust paths to the test environment
		requirejs.config({
			"baseUrl": "../app",

			"paths": {
				// Test paths
				"test": "../test/tests"
			}
		});


		require( [ "text!../test/tests.json" ], function( tests ) {
			tests = JSON.parse( tests ).tests;

			// then load tests and start QUnit
			require( tests, QUnit.start );
		});

	});

});
