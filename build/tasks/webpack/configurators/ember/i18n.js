const { resolve: r } = require( "path" );
const { pRoot } = require( "../../paths" );

const webpack = require( "webpack" );


module.exports = function( config ) {
	Object.assign( config.resolve.alias, {
		"ember-i18n$": r( pRoot, "web_modules", "ember-i18n" )
	});

	// YAML loader (used by EmberI18n)
	config.module.rules.push({
		test: /\.ya?ml$/,
		use: [
			"json-loader",
			"yaml-loader"
		]
	});

	config.plugins.push(
		// replace ember-i18n's get-locales utility function with a custom module
		new webpack.NormalModuleReplacementPlugin(
			/ember-i18n[\/\\]addon[\/\\]utils[\/\\]get-locales\.js$/,
			r( pRoot, "web_modules", "ember-i18n", "get-locales.js" )
		)
	);
};
