const { resolve: r } = require( "path" );
const { pRoot, pDependencies } = require( "../../paths" );
const { buildBabelConfig } = require( "../../utils" );

const webpack = require( "webpack" );


/**
 * EmberJS
 */
module.exports = function( config, isProd ) {
	// custom "ember" module
	Object.assign( config.resolve.alias, {
		"ember$": r( pRoot, "web_modules", "ember" )
	});

	config.module.rules.push({
		test: /\.js$/,
		include: [
			// all app modules
			pRoot,
			// all ember dependencies except ember itself and ones which have their own configs
			{
				test: /ember/,
				include: pDependencies,
				exclude: [
					r( pDependencies, "ember-source" ),
					r( pDependencies, "ember-data" ),
					r( pDependencies, "ember-qunit" )
				]
			}
		],
		loader: "babel-loader",
		options: buildBabelConfig({
			plugins: [
				// translate @ember imports (requires imports to be ignored in webpack - see below)
				"babel-plugin-ember-modules-api-polyfill",
				// transform decorators
				[ "@babel/plugin-proposal-decorators", {
					decoratorsBeforeExport: true
				} ],
				"@babel/plugin-proposal-class-properties"
			]
		})
	});

	config.plugins.push(
		// Ignore all @ember imports, except real modules in the @ember namespace
		// Matches:
		// `@ember`
		// `@ember/foo` (the list of "virtual" @ember modules is long)
		// Does not match:
		// `@ember-foo` (other (related) namespaces should not be matched)
		// `@ember/ordered-set` (is a real module in the same namespace)
		// `@ember/test-helpers` (is a real module in the same namespace)
		new webpack.IgnorePlugin( /@ember(?!-|\/(ordered-set|test-helpers))/ )
	);

	// never parse the ember-source module
	config.module.noParse.push(
		/[\/\\]ember-source[\/\\]dist[\/\\]ember\.(debug|prod)\.js$/
	);

	if ( isProd ) {
		// use non-debug versions of Ember in production builds
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/[\/\\]ember-source[\/\\]dist[\/\\]ember\.debug\.js$/,
				r( pDependencies, "ember-source", "dist", "ember.prod.js" )
			)
		);
	}
};
