const { pApp } = require( "../paths" );

const WebpackI18nCoveragePlugin = require( "../plugins/i18n-coverage" );


/*
 * Config for running an i18n coverage build
 */
module.exports = {
	i18n( config, grunt ) {
		config.stats = "errors-only";

		// don't compile HTMLBars
		// replace rule set by ember config (for current target only)
		config.module.rules.forEach( rule => {
			if ( rule.loader === "hbs-loader" ) {
				rule.loader = "raw-loader";
			}
		});

		config.plugins.push(
			// parse i18n translation keys
			new WebpackI18nCoveragePlugin( grunt, {
				appDir: pApp,
				localesDir: config.resolve.alias.locales,
				defaultLocale: grunt.config( "locales.default" ),
				exclude: grunt.config( "coverage.i18n.exclude" )
			})
		);
	}
};
