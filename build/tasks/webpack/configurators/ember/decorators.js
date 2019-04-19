const { resolve: r } = require( "path" );
const { pDependencies } = require( "../../paths" );
const { buildBabelConfig } = require( "../../utils" );

const webpack = require( "webpack" );


module.exports = function( config, grunt, isProd ) {
	config.module.rules.push({
		test: /\.js$/,
		include: [
			r( pDependencies, "@ember-decorators" ),
			r( pDependencies, "ember-decorators-polyfill" )
		],
		loader: "babel-loader",
		options: buildBabelConfig({
			plugins: [
				[ "babel-plugin-debug-macros", {
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
				[ "babel-plugin-ember-modules-api-polyfill", {
					blacklist: {
						"@ember/debug": [ "assert", "deprecate", "warn" ]
					}
				} ]
			]
		})
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
