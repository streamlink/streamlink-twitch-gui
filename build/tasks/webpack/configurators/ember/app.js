const { pApp } = require( "../../paths" );


/**
 * Custom Ember-Module-Unification loader
 * and Ember related loaders for the app modules
 */
module.exports = function( config ) {
	config.module.rules.push({
		test: /ember-app\.js$/,
		// see `src/web_loaders/ember-app-loader/index.js`
		loader: "ember-app-loader",
		options: {
			context: pApp
		}
	});

	config.module.rules.push({
		test: /\.hbs$/,
		// see `src/web_loaders/hbs-loader.js`
		loader: "hbs-loader"
	});
};
