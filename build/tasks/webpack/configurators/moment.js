const webpack = require( "webpack" );
const locales = require( "../../../../src/config/locales.json" );


/**
 * MomentJS configurations
 */
module.exports = {
	common( config ) {
		// never parse the main MomentJS module
		config.module.noParse.push(
			/[\/\\]moment[\/\\]moment\.js$/
		);

		// only import locale configs of available locales
		config.plugins.push(
			new webpack.ContextReplacementPlugin(
				/moment[\/\\]locale/,
				// regexp for filtering locale config file imports (momentjs, ember-i18n, etc.)
				new RegExp( `(${Object.keys( locales.locales ).join( "|" )})\.js$`, "i" )
			)
		);
	}
};
