const webpack = require( "webpack" );


/**
 * Generic production build configurations
 */
module.exports = {
	prod( config ) {
		// add license banners
		// TODO: fix build date information (reproducible builds)
		config.plugins.push(
			new webpack.BannerPlugin({
				banner: [
					"<%= main['display-name'] %>",
					"@version v<%= package.version %>",
					"@date <%= grunt.template.today('yyyy-mm-dd') %>",
					"@copyright <%= package.author %>"
				].join( "\n" ),
				entryOnly: true
			})
		);
	}
};
