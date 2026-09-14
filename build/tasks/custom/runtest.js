module.exports = function( grunt ) {
	grunt.registerTask( "runtest", "Run the tests in NW.js", function() {
		const cdpConnect = require( "../common/cdp/connect" );
		const cdpQUnit = require( "../common/cdp/qunit" );
		const cdpCoverage = require( "../common/cdp/coverage" );

		const platforms = require( "../common/platforms" );
		const platform = platforms.getPlatform();

		const isCI = process.env[ "CI" ] === "true";
		const isCoverage = !!this.flags.coverage;

		const done = this.async();
		const options = this.options({
			host: "127.0.0.1",
			port: isCI ? 4444 : 8000,
			connectAttempts: isCI ? 10 : 5,
			connectDelay: isCI ? 2000 : 1000,
			startTimeout: 10000,
			testTimeout: 300000,
			coverageTimeout: 5000
		});

		const nwConf = grunt.config( "nwjs" );
		const { options: nwOptions, [ platform ]: { options: nwPlatformOptions } } = nwConf;

		const argv = [ `--remote-debugging-port=${options.port}` ];
		if ( isCI ) {
			argv.unshift( "--disable-gpu", "--no-sandbox" );
		}
		const nwjsOptions = Object.assign( {}, nwOptions, nwPlatformOptions, {
			mode  : "run",
			glob  : false,
			flavor: "sdk",
			srcDir: options.path,
			argv
		});

		let nwProcess;

		function kill() {
			if ( nwProcess ) {
				// workaround for the close event log message
				nwProcess.removeAllListeners( "close" );

				// now kill the child process
				nwProcess.kill();
				nwProcess = undefined;

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

			grunt.log.debug( "Starting NW.js..." );

			// start the NW.js process (or download NW.js first)
			// reject if NW.js fails to start or exits prematurely
			import( "nw-builder" )
				.then( ( { default: nwbuild } ) => nwbuild( nwjsOptions ) )
				.then( childProcess => {
					grunt.log.debug( "NW.js started" );

					nwProcess = childProcess;
					nwProcess.on( "close", () => {
						reject( "NW.js exited prematurely" );
					});

					// connect to NW.js
					return cdpConnect( options, grunt.log.error )
						.then( async cdp => {
							grunt.log.debug( `Connected to ${options.host}:${options.port}` );

							// set up and start QUnit
							await cdpQUnit( grunt, options, cdp );
							if ( isCoverage ) {
								await cdpCoverage( grunt, options, cdp );
							}
						});
				})
				// resolve on a successful test run
				.then( resolve, reject );
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
