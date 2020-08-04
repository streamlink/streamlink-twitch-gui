const platforms = require( "../../common/platforms" );


class NwjsPlugin {
	constructor( nwOptions = {}, options = {} ) {
		this.nwOptions = Object.assign( {}, nwOptions, {
			flavor: "sdk",
			platforms: [ platforms.getPlatform() ]
		});
		this.options = Object.assign({
			rerunOnExit: true,
			log: true,
			logStdOut: true,
			logStdErr: true
		}, options );
		this.launched = false;
	}

	apply( compiler ) {
		compiler.hooks.done.tap( "NwjsPlugin", () => {
			if ( !this.launched ) {
				this._run();
				this.launched = true;
			}
		});
	}

	_run() {
		const NwBuilder = require( "nw-builder" );
		const { nwOptions, options } = this;

		function log( msg ) {
			/* eslint-disable no-console */
			console.log( String( msg ).trim() );
		}

		function launch() {
			const nw = new NwBuilder( nwOptions );

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
