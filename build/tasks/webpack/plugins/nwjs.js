const platforms = require( "../../common/platforms" );


class NwjsPlugin {
	constructor( nwConf = {}, nwOptionsOverride = {}, options = {} ) {
		const platform = platforms.getPlatform();
		const { options: nwOptions, [ platform ]: { options: nwPlatformOptions } } = nwConf;

		this.nwOptions = Object.assign(
			{ mode: "run", glob: false },
			nwOptions,
			nwPlatformOptions,
			nwOptionsOverride
		);
		this.options = Object.assign({
			rerunOnExit: true
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
		const { nwOptions, options } = this;

		function launch() {
			import( "nw-builder" )
				.then( ( { default: nwbuild } ) => nwbuild( nwOptions ) )
				.then( nwProcess => {
					if ( !nwProcess || !options.rerunOnExit ) {
						return;
					}
					nwProcess.on( "close", () => {
						setTimeout( launch, 1000 );
					});
				});
		}

		launch();
	}
}


module.exports = NwjsPlugin;
