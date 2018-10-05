const { resolve: r } = require( "path" );
const { pDependencies, pCacheBabel } = require( "../../paths" );

const webpack = require( "webpack" );


module.exports = function( config, isProd ) {
	config.module.rules.push({
		test: /\.js$/,
		include: r( pDependencies, "@ember-decorators" ),
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
								DEBUG: !isProd,
								CI: false
							}
						},
						{
							source: "ember-decorators-flags",
							flags: {
								DEBUG: !isProd,
								THROW_ON_COMPUTED_OVERRIDE: false
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
				} ]
			]
		}
	});

	config.plugins.push(
		new webpack.NormalModuleReplacementPlugin(
			/@ember-decorators/,
			resource => {
				resource.request = resource.request.replace(
					/@ember-decorators\/\w+/,
					match => `${match}/addon`
				);
			}
		)
	);
};
