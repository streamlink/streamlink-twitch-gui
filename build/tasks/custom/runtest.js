module.exports = function( grunt ) {
	grunt.registerTask( "runtest", "Run the tests in NW.js", async function() {
		const { default: nwbuild } = await import( "nw-builder" );
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
			mode: "run",
			flavor: "sdk",
			srcDir: options.path,
			glob: false,
			argv: argv,
		});

		const nwjs = await nwbuild( nwjsOptions );

		function kill() {
			if ( !nwjs.killed ) {
				nwjs.kill();
				grunt.log.debug( "NW.js stopped" );
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
				cdpConnect( options, grunt.log.error )
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
