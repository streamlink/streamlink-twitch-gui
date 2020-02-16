const { resolve: r } = require( "path" );
const { pProjectRoot } = require( "../paths" );

const webpack = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );


/**
 * Generic production build configurations
 */
module.exports = {
	prod( config, grunt ) {
		// add license banners
		const banner = [
			grunt.config( "main.display-name" ),
			`@version v${grunt.config( "package.version" )}`,
			`@date ${new Date().toISOString()}`,
			`@copyright ${grunt.config( "package.author" )}`
		].join( "\n" );

		config.plugins.push(
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
