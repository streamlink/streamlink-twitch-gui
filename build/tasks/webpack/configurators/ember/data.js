const { resolve: r } = require( "path" );
const { pRoot, pDependencies, pCacheBabel } = require( "../../paths" );


/**
 * EmberData
 * https://github.com/emberjs/data/blob/v3.3.2/index.js
 * https://github.com/emberjs/data/blob/v3.3.2/lib/stripped-build-plugins.js
 * https://github.com/babel/ember-cli-babel/blob/v6.17.1/index.js
 */
module.exports = function( config, isProd ) {
	Object.assign( config.resolve.alias, {
		"ember-data/version$": r( pRoot, "web_modules", "ember-data", "version" ),
		"ember-data/app": r( pDependencies, "ember-data", "app" ),
		"ember-data": r( pDependencies, "ember-data", "addon" ),
		"ember-inflector": r( pDependencies, "ember-inflector", "addon" ),
		"ember-data-model-fragments": r( pDependencies, "ember-data-model-fragments", "addon" ),
		"ember-localstorage-adapter": r( pDependencies, "ember-localstorage-adapter", "addon" ),
		"@ember/ordered-set": r( pDependencies, "@ember", "ordered-set", "addon" ),
		"ember-copy": r( pDependencies, "ember-copy", "addon" )
	});

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

	config.module.rules.push({
		test: /\.js$/,
		include: r( pDependencies, "ember-data" ),
		loader: "babel-loader",
		options: {
			cacheDirectory: pCacheBabel,
			presets: [],
			plugins: [
				[ require( "babel-plugin-feature-flags" ), {
					import: {
						module: "ember-data/-private/features"
					},
					features: {}
				} ],
				require( "babel6-plugin-strip-heimdall" ),
				[ require( "babel-plugin-filter-imports" ), {
					imports: filteredImports
				} ],
				[ require( "../../plugins/babel-plugin-remove-imports" ), filteredImports ],
				[ require( "@babel/plugin-transform-block-scoping" ).default, {
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
			]
		}
	});
};
