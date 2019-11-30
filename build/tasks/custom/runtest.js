const NwBuilder = require( "nw-builder" );
const cdpConnect = require( "../common/cdp/connect" );
const cdpQUnit = require( "../common/cdp/qunit" );
const cdpCoverage = require( "../common/cdp/coverage" );

const nwjsTaskOptions = require( "../configs/nwjs" ).options;
const currentPlatform = require( "../common/platforms" ).getPlatforms( [] );


module.exports = function( grunt ) {
	const task = "runtest";
	const descr = "Run the tests in NW.js";

	grunt.registerTask( task, descr, function() {
		const done = this.async();
		const options = this.options({
			host: "localhost",
			port: 8000,
			connectAttempts: 3,
			connectDelay: 1000,
			startTimeout: 10000,
			testTimeout: 300000,
			coverageTimeout: 5000
		});
		const isCoverage = !!this.flags.coverage;


		const nwjsOptions = Object.assign( {}, grunt.config.process( nwjsTaskOptions ), {
			platforms: currentPlatform,
			argv: [ `--remote-debugging-port=${options.port}` ],
			files: options.path,
			flavor: "sdk"
		});
		const nwjs = new NwBuilder( nwjsOptions );


		function kill() {
			if ( nwjs.isAppRunning() ) {
				const appProcess = nwjs.getAppProcess();

				// workaround for the close event log message
				appProcess.removeAllListeners( "close" );
				nwjs._nwProcess = undefined;

				// now kill the child process
				appProcess.kill();

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

		new Promise( ( resolve, reject ) => {
			process.on( "exit", kill );

			nwjs.on( "log", grunt.log.writeln.bind( grunt.log ) );
			nwjs.on( "stdout", grunt.log.writeln.bind( grunt.log ) );
			nwjs.on( "stderr", grunt.log.writeln.bind( grunt.log ) );

			// listen for the appstart event
			nwjs.on( "appstart", () => {
				grunt.log.debug( "NW.js started" );

				const nwjsProcess = nwjs.getAppProcess();
				nwjsProcess.on( "close", () => {
					reject( "NW.js exited prematurely" );
				});

				// connect to NW.js
				cdpConnect( options )
					.then( async cdp => {
						grunt.log.debug( `Connected to ${options.host}:${options.port}` );

						// set up and start QUnit
						await cdpQUnit( grunt, options, cdp );
						if ( isCoverage ) {
							await cdpCoverage( grunt, options, cdp );
						}
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
			.then( noShutdown => {
				if ( noShutdown !== true ) {
					kill();
				}
			})
			.then( done, fail );
	});
};
