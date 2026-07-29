const { resolve: r } = require( "path" );
const { pProjectRoot } = require( "../paths" );
const Date = require( "../../common/date" );

const webpack = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const { SubresourceIntegrityPlugin } = require( "webpack-subresource-integrity" );


/**
 * Generic release build configurations
 */
module.exports = {
	_release( config, grunt, isProd ) {
		// add license banners
		const banner = [
			grunt.config( "main.display-name" ),
			`@version ${grunt.config( "version" )}`,
			`@date ${new Date().toISOString()}`,
			`@copyright ${grunt.config( "package.author" )}`,
			`@license ${grunt.config( "package.license" )}`
		];

		if ( isProd ) {
			banner.push(
				"",
				"DO NOT MODIFY THIS FILE, OR THE APPLICATION WILL BREAK"
			);
			config.plugins.push(
				new SubresourceIntegrityPlugin({
					hashFuncNames: [ "sha256" ]
				})
			);
		}

		config.plugins.push(
			new webpack.BannerPlugin({
				banner: banner.join( "\n" ),
				entryOnly: true
			})
		);

		config.plugins.push(
			new CopyWebpackPlugin({
				patterns: [{
					from: r( pProjectRoot, "LICENSE" ),
					to: "[name].txt"
				}]
			})
		);
	},

	debug( ...args ) {
		return this._release( ...args, false );
	},

	prod( ...args ) {
		return this._release( ...args, true );
	}
};
