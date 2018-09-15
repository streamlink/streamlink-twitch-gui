const { resolve: r } = require( "path" );
const { pRoot, pApp, pDependencies, pCacheBabel } = require( "../paths" );

const webpack = require( "webpack" );
const emberFeatures = require( "../../../../src/config/ember-features.json" );


/**
 * Configurations for EmberJS, EmberData, Ember-Addons and everything else related to them.
 */
module.exports = {
	common( config ) {
		// Custom Ember module unification loader
		config.module.rules.push({
			test: /ember-app\.js$/,
			// see `src/web_loaders/ember-app-loader/index.js`
			loader: "ember-app-loader",
			options: {
				context: pApp
			}
		});

		// Ember import polyfill loader (https://github.com/ember-cli/ember-rfc176-data)
		// Requires those `@ember` imports to be ignored (see plugin below)
		config.module.rules.push({
			test: /\.js$/,
			include: [
				// all app modules require an import translation
				pRoot,
				// explicitly list ember addons here which require an import translation
				r( pDependencies, "ember-i18n" )
			],
			loader: "babel-loader",
			options: {
				presets: [],
				plugins: [
					require( "babel-plugin-ember-modules-api-polyfill" )
				],
				cacheDirectory: pCacheBabel
			}
		});

		// EmberData loader
		config.module.rules.push({
			test: /\.js$/,
			include: r( pDependencies, "ember-data", "addon" ),
			loader: "babel-loader",
			options: {
				presets: [],
				plugins: [
					[ require( "babel-plugin-feature-flags" ), {
						import: {
							module: "ember-data/-private/features"
						},
						features: emberFeatures
					} ],
					require( "babel6-plugin-strip-heimdall" ),
					require( "babel6-plugin-strip-class-callcheck" )
				],
				cacheDirectory: pCacheBabel
			}
		});

		// Handlebars loader
		// see `src/web_loaders/hbs-loader.js`
		config.module.rules.push({
			test: /\.hbs$/,
			loader: "hbs-loader"
		});

		// YAML loader (used by EmberI18n)
		config.module.rules.push({
			test: /\.ya?ml$/,
			use: [
				"json-loader",
				"yaml-loader"
			]
		});

		// never parse the main ember module
		config.module.noParse.push(
			/[\/\\]ember-source[\/\\]dist[\/\\]ember\.(debug|prod)\.js$/
		);

		// ignore all @ember imports (see `../loaders/ember.js`)
		config.plugins.push(
			new webpack.IgnorePlugin( /@ember/ )
		);

		// replace ember-i18n's get-locales utility function with a custom module
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/ember-i18n[\/\\]addon[\/\\]utils[\/\\]get-locales\.js$/,
				r( pRoot, "web_modules", "ember-i18n", "get-locales.js" )
			)
		);

		// Resolve aliases
		// Used for fixing and correctly importing Ember modules with Webpack. Addons need to be
		// added explicitly here. Some import paths or whole modules need to be replaced and can be
		// found in the `src/web_modules` directory.
		Object.assign( config.resolve.alias, {
			"ember": r( pRoot, "web_modules", "ember" ),
			"ember-data/version$": r( pRoot, "web_modules", "ember-data", "version" ),
			"ember-data/app": r( pDependencies, "ember-data", "app" ),
			"ember-data": r( pDependencies, "ember-data", "addon" ),
			"ember-inflector": r( pDependencies, "ember-inflector", "addon" ),
			"ember-data-model-fragments": r( pDependencies, "ember-data-model-fragments", "addon" ),
			"ember-localstorage-adapter": r( pDependencies, "ember-localstorage-adapter", "addon" ),
			"ember-i18n$": r( pRoot, "web_modules", "ember-i18n" )
		});
	},

	prod( config ) {
		// strip debug stuff from EmberData in production builds
		// https://github.com/emberjs/data/blob/v2.11.3/lib/stripped-build-plugins.js#L48
		config.module.rules.unshift({
			test: /\.js$/,
			include: r( pDependencies, "ember-data", "addon" ),
			loader: "babel-loader",
			options: {
				presets: [],
				plugins: [
					[ require( "babel-plugin-filter-imports" ), {
						imports: {
							"ember-data/-private/debug": [
								"instrument",
								"assert",
								"assertPolymorphicType",
								"debug",
								"deprecate",
								"info",
								"runInDebug",
								"warn",
								"debugSeal"
							]
						}
					}]
				],
				cacheDirectory: pCacheBabel
			}
		});

		// use non-debug versions of Ember in production builds
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/[\/\\]ember-source[\/\\]dist[\/\\]ember\.debug\.js$/,
				r( pDependencies, "ember-source", "dist", "ember.prod.js" )
			)
		);
	}
};
