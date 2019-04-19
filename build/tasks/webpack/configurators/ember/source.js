const { resolve: r } = require( "path" );
const { pRoot, pDependencies } = require( "../../paths" );
const { buildBabelConfig } = require( "../../utils" );

const webpack = require( "webpack" );


/**
 * EmberJS
 */
module.exports = function( config, grunt, isProd ) {
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
				[ "@babel/plugin-transform-runtime", {
					corejs: false,
					helpers: true,
					regenerator: false,
					useESModules: true,
					// https://github.com/babel/babel/issues/9454#issuecomment-460425922
					version: "7.2.2"
				} ],
				// translate @ember imports (requires imports to be ignored in webpack - see below)
				"babel-plugin-ember-modules-api-polyfill",
				// transform decorators
				[ "@babel/plugin-proposal-decorators", {
					// https://emberjs.github.io/rfcs/0440-decorator-support.html
					// https://github.com/babel/ember-cli-babel/blob/v7.7.3/index.js#L341
					// Move forward with the Decorators RFC via stage 1 decorators,
					// and await a stable future decorators proposal.
					legacy: true
				} ],
				[ "@babel/plugin-proposal-class-properties", {
					// https://babeljs.io/docs/en/babel-plugin-proposal-decorators
					// When using the legacy mode, class-properties must be used in loose mode
					loose: true
				} ]
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
