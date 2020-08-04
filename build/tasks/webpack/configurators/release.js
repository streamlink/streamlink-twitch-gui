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
		}

		config.plugins.push(
			new webpack.BannerPlugin({
				banner: banner.join( "\n" ),
				entryOnly: true
			})
		);

		config.plugins.push(
			new CopyWebpackPlugin([{
				from: r( pProjectRoot, "LICENSE" ),
				transformPath: targetPath => `${targetPath}.txt`
			}])
		);
	},

	debug( ...args ) {
		return this._release( ...args, false );
	},

	prod( ...args ) {
		return this._release( ...args, true );
	}
};
