const { resolve: r } = require( "path" );
const { pProjectRoot } = require( "../paths" );
const Date = require( "../../common/date" );

const webpack = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const WebpackSubresourceIntegrity = require( "webpack-subresource-integrity" );


/**
 * Generic production build configurations
 */
module.exports = {
	prod( config, grunt ) {
		// add license banners
		const banner = [
			grunt.config( "main.display-name" ),
			`@version ${grunt.config( "version" )}`,
			`@date ${new Date().toISOString()}`,
			`@copyright ${grunt.config( "package.author" )}`,
			`@license ${grunt.config( "package.license" )}`,
			"",
			"DO NOT MODIFY THIS FILE, OR THE APPLICATION WILL BREAK"
		].join( "\n" );

		config.plugins.push(
			new WebpackSubresourceIntegrity({
				hashFuncNames: [ "sha256" ]
			}),
			new webpack.BannerPlugin({
				banner,
				entryOnly: true
			})
		);

		config.plugins.push(
			new CopyWebpackPlugin([{
				from: r( pProjectRoot, "LICENSE" ),
				transformPath: targetPath => `${targetPath}.txt`
			}])
		);
	}
};
