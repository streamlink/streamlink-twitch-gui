const { resolve: r } = require( "path" );
const { pTest, pDependencies, pCacheBabel } = require( "../../paths" );

const webpack = require( "webpack" );


/**
 * Configs for setting up ember-qunit and @ember/test-helpers
 */
module.exports = function( config ) {
	const pEmberQunit = r( pDependencies, "ember-qunit", "addon-test-support", "ember-qunit" );
	const pEmberTestHelpers = r( pDependencies, "@ember", "test-helpers", "addon-test-support" );

	Object.assign( config.resolve.alias, {
		"ember-qunit": pEmberQunit,
		"ember-test-helpers": r( pEmberTestHelpers, "ember-test-helpers" ),
		"@ember/test-helpers": r( pEmberTestHelpers, "@ember", "test-helpers" ),
		"htmlbars-inline-precompile": r( pTest, "web_modules", "htmlbars-inline-precompile" )
	});

	config.module.rules.push({
		test: /\.js$/,
		include: r( pDependencies, "ember-qunit" ),
		loader: "babel-loader",
		options: {
			cacheDirectory: pCacheBabel,
			presets: [],
			plugins: [
				[ require( "babel-plugin-debug-macros" ), {
					flags: [
						{
							source: "@glimmer/env",
							flags: {
								DEBUG: false,
								CI: false
							}
						}
					],
					externalizeHelpers: {
						global: "Ember"
					},
					debugTools: {
						isDebug: false,
						source: "@ember/debug",
						assertPredicateIndex: 1
					}
				} ],
				[ require( "babel-plugin-ember-modules-api-polyfill" ), {
					blacklist: {
						"@ember/debug": [ "assert", "deprecate", "warn" ]
					}
				} ]
			]
		}
	});

	config.plugins.push(
		// remove ember-qunit's test-loader module which depends on ember-cli
		new webpack.NormalModuleReplacementPlugin(
			/[\/\\]ember-qunit[\/\\]test-loader\.js$/,
			r( pTest, "web_modules", "ember-qunit", "test-loader.js" )
		)
	);
};
