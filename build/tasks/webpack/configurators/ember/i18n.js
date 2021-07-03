const { resolve: r } = require( "path" );

const { pDependencies, pLocales } = require( "../../paths" );
const { buildBabelConfig } = require( "../../utils" );


module.exports = function( config ) {
	// translations
	config.module.rules.push({
		test: /\.ya?ml$/,
		include: pLocales,
		use: [
			"optimized-json-loader",
			"yaml-loader"
		]
	});

	Object.assign( config.resolve.alias, {
		"ember-intl": r( pDependencies, "ember-intl", "addon" )
	});

	config.module.rules.push({
		test: /\.ts$/,
		include: r( pDependencies, "ember-intl" ),
		loader: "babel-loader",
		options: buildBabelConfig({
			plugins: [
				[ "babel-plugin-debug-macros", {
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
				[ "babel-plugin-ember-modules-api-polyfill", {
					ignore: {
						"@ember/debug": [ "assert", "deprecate", "warn" ]
					}
				} ],
				"@babel/plugin-transform-typescript"
			]
		})
	});
};
