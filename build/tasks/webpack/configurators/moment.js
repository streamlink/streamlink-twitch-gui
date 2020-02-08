const webpack = require( "webpack" );


/**
 * MomentJS configurations
 */
module.exports = {
	common( config, grunt ) {
		// never parse the main MomentJS module
		config.module.noParse.push(
			/[\/\\]moment[\/\\]moment\.js$/
		);

		const locales = grunt.config( "locales.locales" );
		// regexp for filtering locale config file imports (momentjs, ember-i18n, etc.)
		const reContext = new RegExp( `(${Object.keys( locales ).join( "|" )})\.js$`, "i" );

		// only import locale configs of available locales
		config.plugins.push(
			new webpack.ContextReplacementPlugin( /moment[\/\\]locale/, reContext )
		);
	}
};
