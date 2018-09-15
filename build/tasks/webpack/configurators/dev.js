const webpack = require( "webpack" );
const NwjsPlugin = require( "../plugins/nwjs" );


/**
 * Configurations for creating and running development builds
 */
module.exports = {
	_dev( config, path ) {
		// watch and rebuild
		Object.assign( config, {
			watch: true,
			keepalive: true,
			failOnError: false
		});

		// launch NW.js after a successful build
		config.plugins.push(
			new NwjsPlugin({
				files: `<%= dir.${path} %>/**`,
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

	dev( config ) {
		this._dev( config, "tmp_dev" );
		this._debug( config, true );
	},

	prod( config ) {
		this._debug( config, false );
	},

	test( config ) {
		this._debug( config, false );
	},

	testdev( config ) {
		this._dev( config, "tmp_test" );
		this._debug( config, false );
	},

	coverage( config ) {
		this._debug( config, false );
	}
};
