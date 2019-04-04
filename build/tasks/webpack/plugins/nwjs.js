const platforms = require( "../../common/platforms" );


class NwjsPlugin {
	constructor( gruntconfig, options ) {
		this.options = Object.assign( {}, gruntconfig.nwjs.options, options, {
			flavor: "sdk",
			platforms: platforms.getPlatforms( [] )
		});
		this.launched = false;
	}

	apply( compiler ) {
		compiler.hooks.done.tap( "NwjsPlugin", () => {
			if ( !this.launched ) {
				this.run();
			}
			this.launched = true;
		});
	}

	run() {
		const NwBuilder = require( "nw-builder" );
		const options = this.options;

		function log( msg ) {
			/* eslint-disable no-console */
			console.log( String( msg ) );
		}

		function launch() {
			const nw = new NwBuilder( options );

			if ( options.log ) {
				nw.on( "log", log );
			}
			if ( options.log && options.logStdOut ) {
				nw.on( "stdout", log );
			}
			if ( options.log && options.logStdErr ) {
				nw.on( "stderr", log );
			}

			nw.run().then(function() {
				if ( options.rerunOnExit ) {
					setTimeout( launch, 1000 );
				}
			});
		}

		launch();
	}
}


module.exports = NwjsPlugin;
