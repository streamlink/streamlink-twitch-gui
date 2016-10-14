/**
 * @returns {Promise}
 */
module.exports = function( grunt, options, chrome ) {
	return new Promise(function( resolve, reject ) {
		var UUID = "qunit_" + Date.now() + "_" + Math.random().toString( 36 ).substring( 2, 15 );
		var started = false;

		// wait X seconds for QUnit to start or reject the promise
		var startTimeout = setTimeout( function() {
			reject( "Timeout: Missing QUnit.start() call" );
		}, options.startTimeout );
		// wait X seconds for all tests to finish
		var testTimeout;

		// listen for qunit messages
		chrome.on( "Console.messageAdded", function( message ) {
			if ( !message || !message.message ) { return; }
			var params = message.message.parameters;
			if ( !params || params.length !== 3 || params[ 0 ].value !== UUID ) { return; }
			var event = params[ 1 ].value;
			var data = JSON.parse( params[ 2 ].value );

			switch ( event ) {
				case "begin":
					if ( started === true ) { return; }
					started = true;

					if ( startTimeout ) {
						clearTimeout( startTimeout );
					}

					testTimeout = setTimeout(function() {
						reject( "Timeout: The tests did not finish..." );
					}, options.testTimeout );
					return;

				case "moduleDone":
					if ( !options.logModules ) { return; }

					grunt.log[ data.failed === 0 ? "ok" : "warn" ](
						data.name + " (" + data.passed + "/" + data.total + ")"
					);
					return;

				case "done":
					if ( testTimeout ) {
						clearTimeout( testTimeout );
					}

					if ( options.logModules && data.total > 0 ) {
						grunt.log.writeln( "" );
					}

					// resolve or reject the promise
					if ( data.failed === 0 && data.passed === data.total ) {
						if ( data.total === 0 ) {
							grunt.log.warn(
								"0/0 assertions ran (" + data.runtime + "ms)"
							);
						} else if ( data.total > 0 ) {
							grunt.log.ok(
								data.total + " assertions passed (" + data.runtime + "ms)"
							);
						}
						resolve();
					} else {
						grunt.log.warn(
							  data.failed + "/" + data.total
							+ " assertions failed (" + data.runtime + "ms)"
						);
						reject();
					}
					return;
			}
		});


		/*
		 * This function will be executed by NW.js over the remote connection
		 */
		function setupQUnit( QUnit ) {
			function logMessage( callback, obj ) {
				console.log( "%UUID%", callback, JSON.stringify( obj ) );
			}

			[
				"testStart",
				"testDone",
				"moduleStart",
				"moduleDone",
				"begin",
				"done"
			].forEach(function( callback ) {
				QUnit[ callback ]( logMessage.bind( null, callback ) );
			});
		}

		// setup QUnit
		chrome.Runtime.evaluate({
			expression: "window.setupQUnit=" + setupQUnit.toString().replace( "%UUID%", UUID )
		}, function() {
			grunt.log.debug( "QUnit test reporter injected" );

			// start QUnit
			chrome.Runtime.evaluate({
				expression: "window.startQUnit&&window.startQUnit()"
			}, function() {
				grunt.log.debug( "QUnit started" );
			});
		});
	});
};
