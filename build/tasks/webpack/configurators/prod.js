const webpack = require( "webpack" );


/**
 * Generic production build configurations
 */
module.exports = {
	prod( config, gruntconfig ) {
		// add license banners
		const banner = [
			gruntconfig.main[ "display-name" ],
			`@version v${gruntconfig.package.version}`,
			`@date ${new Date().toISOString()}`,
			`@copyright ${gruntconfig.package.author}`
		].join( "\n" );

		config.plugins.push(
			new webpack.BannerPlugin({
				banner,
				entryOnly: true
			})
		);
	}
};
