const webpack = require( "webpack" );


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
	}
};
