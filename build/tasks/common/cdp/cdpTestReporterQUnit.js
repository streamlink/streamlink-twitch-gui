const consoleMethod = "info";

/**
 * @returns {Promise}
 */
module.exports = function( grunt, options, cdp ) {
	const UUID = `qunit_${Date.now()}_${Math.random().toString( 36 ).substring( 2, 15 )}`;

	function promiseQUnitBridge( resolve, reject ) {
		let started = false;
		let done = false;

		// wait X seconds for QUnit to start or reject the promise
		const startTimeout = setTimeout( () => {
			reject( "Timeout: Missing QUnit.start() call" );
		}, options.startTimeout );
		// wait X seconds for all tests to finish
		let testTimeout;

		const failures = [];

		function onBegin() {
			if ( started === true ) { return; }
			started = true;

			if ( startTimeout ) {
				clearTimeout( startTimeout );
			}

			testTimeout = setTimeout( () => {
				reject( "Timeout: The tests did not finish..." );
			}, options.testTimeout );
		}

		function onTestDone({ name, failed, passed, total, assertions, runtime }) {
			if ( failed === 0 ) { return; }
			failures.push( `[test] ${name||"Global"} (${passed}/${total}) (${runtime}ms)` );
			assertions.forEach( ( { result, message }, idx ) => {
				if ( result ) { return; }
				failures.push( `[assertion ${idx+1}] ${message}` );
			});
		}

		function onModuleDone({ name, failed, passed, total, runtime }) {
			grunt.log[ failed === 0 ? "ok" : "warn" ](
				`${failed?"[module] ":""}${name||"Global"} (${passed}/${total}) (${runtime}ms)`
			);
			if ( failures.length ) {
				failures.splice( 0, failures.length ).forEach( line => grunt.log.warn( line ) );
			}
		}

		function onDone({ failed, passed, total, runtime }) {
			done = true;

			if ( testTimeout ) {
				clearTimeout( testTimeout );
			}

			if ( total > 0 ) {
				grunt.log.writeln( "" );
			}

			// resolve or reject the promise
			if ( failed === 0 && passed === total ) {
				if ( total === 0 ) {
					grunt.log.warn( `0/0 assertions ran (${runtime}ms)` );
				} else if ( total > 0 ) {
					grunt.log.ok( `${total} assertions passed (${runtime}ms)` );
				}
				resolve();
			} else {
				grunt.log.warn( `${failed}/${total} assertions failed (${runtime}ms)` );
				reject();
			}
		}

		const eventCallbacks = {
			"begin": onBegin,
			"testDone": onTestDone,
			"moduleDone": onModuleDone,
			"done": onDone
		};

		// listen for qunit messages
		cdp.on( "Runtime.consoleAPICalled", obj => {
			if ( done || !obj || !obj.type || obj.type !== consoleMethod ) { return; }
			const params = obj.args;
			if ( !params || params.length !== 3 || params[ 0 ].value !== UUID ) { return; }
			const event = params[ 1 ].value;
			const data = JSON.parse( params[ 2 ].value );

			if ( eventCallbacks[ event ] ) {
				eventCallbacks[ event ]( data );
			}
		});


		/*
		 * This function will be executed by NW.js over the remote connection
		 */
		function setupQUnit( QUnit ) {
			delete global._setupQUnitBridge;

			function logMessage( callback, obj ) {
				/* eslint-disable no-console */
				console[ "%METHOD%" ]( "%UUID%", callback, JSON.stringify( obj ) );
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

			QUnit.start();
		}

		const expression = [
			"(function() {",
			setupQUnit
				.toString()
				.replace( "%METHOD%", consoleMethod )
				.replace( "%UUID%", UUID ),
			"if ( global._setupQUnitBridge ) {",
			"setupQUnit( global._setupQUnitBridge );",
			"} else {",
			"global._setupQUnitBridge = setupQUnit;",
			"}",
			"})();"
		].join( "\n" );

		// setup & start QUnit
		cdp.send( "Runtime.evaluate", { expression: expression } )
			.then( () => {
				grunt.log.debug( "QUnit test reporter injected and QUnit started" );
			});
	}


	return cdp.send( "Runtime.enable" )
		.then( () => new Promise( promiseQUnitBridge ) );
};
