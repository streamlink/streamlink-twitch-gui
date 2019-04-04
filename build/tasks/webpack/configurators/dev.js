const webpack = require( "webpack" );
const NwjsPlugin = require( "../plugins/nwjs" );


/**
 * Configurations for creating and running development builds
 */
module.exports = {
	_dev( config, path, gruntconfig ) {
		// watch and rebuild
		Object.assign( config, {
			watch: true,
			keepalive: true,
			failOnError: false
		});

		// launch NW.js after a successful build
		config.plugins.push(
			new NwjsPlugin( gruntconfig, {
				files: `${gruntconfig.dir[ path ]}/**`,
				argv: "--remote-debugging-port=8888",
				rerunOnExit: true,
				log: true,
				logStdOut: true,
				logStdErr: true
			})
		);
	},

	_debug( config, DEBUG ) {
		// set DEBUG to true on each dev-target
		config.plugins.push(
			new webpack.DefinePlugin({
				DEBUG
			})
		);
	},

	dev( config, ...args ) {
		this._dev( config, "tmp_dev", ...args );
		this._debug( config, true );
	},

	prod( config ) {
		this._debug( config, false );
	},

	test( config ) {
		this._debug( config, false );
	},

	testdev( config, ...args ) {
		this._dev( config, "tmp_test", ...args );
		this._debug( config, false );
	},

	coverage( config ) {
		this._debug( config, false );
	}
};
