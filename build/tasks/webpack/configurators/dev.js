const webpack = require( "webpack" );
const NwjsPlugin = require( "../plugins/nwjs" );


/**
 * Configurations for creating and running development builds
 */
module.exports = {
	_launch( config, grunt, path ) {
		// watch and rebuild
		Object.assign( config, {
			watch: true,
			keepalive: true,
			failOnError: false
		});

		// launch NW.js after a successful build
		config.plugins.push(
			new NwjsPlugin( Object.assign( {}, grunt.config( "nwjs" ).options, {
				files: `${grunt.config( "dir" )[ path ]}/**`,
				argv: "--remote-debugging-port=8888"
			}) )
		);
	},

	common( config, grunt, target ) {
		config.plugins.push(
			new webpack.DefinePlugin({
				// debug build on top of NW.js SDK flavor
				// with dev-tools, debug logging and initial warning message
				DEBUG: target === "debug",
				// same as debug build, but without initial warning message
				DEVELOPMENT: target === "dev"
			})
		);
	},

	dev( config, grunt ) {
		this._launch( config, grunt, "tmp_dev" );
	},

	testdev( config, grunt ) {
		this._launch( config, grunt, "tmp_test" );
	}
};
