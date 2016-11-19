var NwBuilder = require( "nw-builder" );
var cdpConnection = require( "../common/cdp/cdpConnection" );
var cdpTestReporterQUnit = require( "../common/cdp/cdpTestReporterQUnit" );

var nwjsTaskOptions = require( "../configs/nwjs" ).options;
var currentPlatform = require( "../common/platforms" ).getPlatforms( [] );


module.exports = function( grunt ) {
	var task  = "runtest";
	var descr = "Run the tests in NW.js";

	grunt.registerTask( task, descr, function() {
		var done    = this.async();
		var options = this.options({
			startTimeout: 5000,
			testTimeout : 300000,
			logModules  : true,
			host        : "localhost",
			port        : 8000
		});


		var nwjsOptions = Object.assign( {}, grunt.config.process( nwjsTaskOptions ), {
			platforms: currentPlatform,
			argv: [ "--remote-debugging-port=" + options.port ],
			files: options.path,
			flavor: "sdk"
		});
		var nwjs = new NwBuilder( nwjsOptions );


		function kill() {
			if ( nwjs.isAppRunning() ) {
				nwjs.getAppProcess().kill();
				grunt.log.debug( "NW.js stopped" );
				process.removeListener( "exit", kill );
			}
		}

		function fail( err ) {
			kill();
			if ( err ) {
				grunt.fail.fatal( String( err ) );
			} else {
				grunt.util.exit( 1 );
			}
		}

		new Promise(function( resolve, reject ) {
			process.on( "exit", kill );

			// listen for the appstart event
			nwjs.on( "appstart", function() {
				grunt.log.debug( "NW.js started" );

				var nwjsProcess = nwjs.getAppProcess();
				nwjsProcess.on( "close", function() {
					reject( "NW.js exited prematurely" );
				});

				// connect to NW.js
				cdpConnection( options )
					.then(function( cdp ) {
						grunt.log.debug( "Connected to " + options.host + ":" + options.port );

						// set up and start QUnit
						return cdpTestReporterQUnit( grunt, options, cdp );
					})
					// resolve on a successful test run
					.then( resolve, reject );
			});

			grunt.log.debug( "Starting NW.js..." );

			// start the NW.js process (or download NW.js first)
			// reject if NW.js exited prematurely
			nwjs.run().then( reject, reject );
		})
			// make sure to terminate the NW.js process
			.then(function( noShutdown ) {
				if ( noShutdown !== true ) {
					kill();
				}
			})
			.then( done, fail );
	});
};
