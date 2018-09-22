const { resolve: r } = require( "path" );
const { pRoot, pApp, pDependencies, pCacheBabel } = require( "../paths" );

const webpack = require( "webpack" );


/**
 * Configurations for EmberJS, EmberData, Ember-Addons and everything else related to them.
 */
module.exports = {
	/**
	 * EmberJS and custom Ember-Module-Unification loader
	 */
	_ember( config ) {
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
				pRoot,
				{
					test: /ember/,
					include: pDependencies
				}
			],
			exclude: [
				r( pDependencies, "ember-source" ),
				// EmberData has its own loader and babel plugins
				r( pDependencies, "ember-data" )
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

		// Handlebars loader
		// see `src/web_loaders/hbs-loader.js`
		config.module.rules.push({
			test: /\.hbs$/,
			loader: "hbs-loader"
		});

		// never parse the main ember module
		config.module.noParse.push(
			/[\/\\]ember-source[\/\\]dist[\/\\]ember\.(debug|prod)\.js$/
		);

		// ignore all @ember imports, except real modules in the @ember namespace
		config.plugins.push(
			new webpack.IgnorePlugin( /@ember(?!\/ordered-set)/ )
		);

		// Resolve aliases
		Object.assign( config.resolve.alias, {
			"ember$": r( pRoot, "web_modules", "ember" )
		});
	},

	/**
	 * EmberData
	 * https://github.com/emberjs/data/blob/v3.3.2/index.js
	 * https://github.com/emberjs/data/blob/v3.3.2/lib/stripped-build-plugins.js
	 * https://github.com/babel/ember-cli-babel/blob/v6.17.1/index.js
	 */
	_emberData( config, isProd ) {
		const filteredImports = {
			// for some reason, the addon subdir is required here
			"ember-data/addon/-debug": [
				"instrument"
			],
			"ember-data/-debug": [
				...( !isProd ? [] : [
					"assertPolymorphicType"
				] )
			]
		};

		// EmberData loader
		config.module.rules.push({
			test: /\.js$/,
			include: r( pDependencies, "ember-data" ),
			loader: "babel-loader",
			options: {
				presets: [],
				plugins: [
					[ require( "babel-plugin-feature-flags" ), {
						import: {
							module: "ember-data/-private/features"
						},
						features: {}
					} ],
					require( "babel6-plugin-strip-heimdall" ),
					[ require( "babel-plugin-filter-imports" ), filteredImports ],
					[ require( "../plugins/babel-plugin-remove-imports" ), filteredImports ],
					[ require( "babel-plugin-transform-es2015-block-scoping" ), {
						throwIfClosureRequired: true
					} ],
					[ require( "babel-plugin-debug-macros" ), {
						flags: [
							{
								source: "@glimmer/env",
								flags: {
									DEBUG: !isProd,
									CI: false
								}
							}
						],
						externalizeHelpers: {
							global: "Ember"
						},
						debugTools: {
							isDebug: !isProd,
							source: "@ember/debug",
							assertPredicateIndex: 1
						}
					} ],
					[ require( "babel-plugin-ember-modules-api-polyfill" ), {
						blacklist: {
							"@ember/debug": [ "assert", "deprecate", "warn" ]
						}
					} ],
					require( "babel6-plugin-strip-class-callcheck" )
				],
				cacheDirectory: pCacheBabel
			}
		});

		// custom `@ember/ordered-set` module
		// https://github.com/emberjs/ember-ordered-set/blob/v1.0.1/addon/index.js#L157
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/@ember[\/\\]ordered-set/,
				r( pRoot, "web_modules", "@ember", "ordered-set.js" )
			)
		);

		// Resolve aliases
		Object.assign( config.resolve.alias, {
			"ember-data/version$": r( pRoot, "web_modules", "ember-data", "version" ),
			"ember-data/app": r( pDependencies, "ember-data", "app" ),
			"ember-data": r( pDependencies, "ember-data", "addon" ),
			"ember-inflector": r( pDependencies, "ember-inflector", "addon" ),
			"ember-data-model-fragments": r( pDependencies, "ember-data-model-fragments", "addon" ),
			"ember-localstorage-adapter": r( pDependencies, "ember-localstorage-adapter", "addon" ),
			"ember-copy": r( pDependencies, "ember-copy", "addon" )
		});
	},

	_emberAddons( config ) {
		// YAML loader (used by EmberI18n)
		config.module.rules.push({
			test: /\.ya?ml$/,
			use: [
				"json-loader",
				"yaml-loader"
			]
		});

		// replace ember-i18n's get-locales utility function with a custom module
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/ember-i18n[\/\\]addon[\/\\]utils[\/\\]get-locales\.js$/,
				r( pRoot, "web_modules", "ember-i18n", "get-locales.js" )
			)
		);

		// Resolve aliases
		Object.assign( config.resolve.alias, {
			"ember-i18n$": r( pRoot, "web_modules", "ember-i18n" )
		});
	},

	_nonProd( config ) {
		this._ember( config );
		this._emberData( config, false );
		this._emberAddons( config );
	},

	dev( config ) {
		this._nonProd( config );
	},

	test( config ) {
		this._nonProd( config );
	},

	testdev( config ) {
		this._nonProd( config );
	},

	coverage( config ) {
		this._nonProd( config );
	},

	prod( config ) {
		this._ember( config );
		this._emberData( config, true );
		this._emberAddons( config );

		// use non-debug versions of Ember in production builds
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/[\/\\]ember-source[\/\\]dist[\/\\]ember\.debug\.js$/,
				r( pDependencies, "ember-source", "dist", "ember.prod.js" )
			)
		);
	}
};
