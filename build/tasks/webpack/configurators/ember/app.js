const { pApp } = require( "../../paths" );


/**
 * Custom Ember-Module-Unification loader
 * and Ember related loaders for the app modules
 */
module.exports = function( config ) {
	config.module.rules.push({
		test: /ember-app\.js$/,
		// see `build/tasks/webpack/loaders/ember-app-loader/index.js`
		loader: "ember-app-loader",
		options: {
			context: pApp
		}
	});

	config.module.rules.push({
		test: /\.hbs$/,
		// see `build/tasks/webpack/loaders/hbs-loader.js`
		loader: "hbs-loader"
	});
};
