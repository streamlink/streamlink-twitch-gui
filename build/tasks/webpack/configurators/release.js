const { resolve: r } = require( "path" );
const { pProjectRoot } = require( "../paths" );
const Date = require( "../../common/date" );

const webpack = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const WebpackSubresourceIntegrity = require( "webpack-subresource-integrity" );


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
				new WebpackSubresourceIntegrity({
					hashFuncNames: [ "sha256" ]
				})
			);
			// FIXME: stats.warningsFilter has been deprecated in webpack 5
			config.stats.warningsFilter.push(
				// integrity checksums are only added for **very simple** anti-tampering reasons
				// there is no security aspect or full manipulation protection, which would normally
				// be considered "useful"
				"webpack-subresource-integrity: This plugin is not useful for non-web targets."
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
					transformPath: targetPath => `${targetPath}.txt`
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
