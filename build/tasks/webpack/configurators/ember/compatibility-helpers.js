const { resolve: r } = require( "path" );
const { pRoot, pDependencies } = require( "../../paths" );
const { buildBabelConfig } = require( "../../utils" );
const { version: emberVersion } = require( "ember-source/package.json" );

const { gte, satisfies } = require( "semver" );
const webpack = require( "webpack" );


/**
 * Configs for removing/replacing debug- or conditional code from various Ember addons
 */
module.exports = function( config ) {
	config.module.rules.push({
		test: /ember/,
		include: pDependencies,
		exclude: [
			r( pDependencies, "ember-source" ),
			r( pDependencies, "ember-data" )
		],
		loader: "babel-loader",
		options: buildBabelConfig({
			plugins: [
				[ "ember-compatibility-helpers/comparision-plugin", {
					emberVersion
				} ],
				[ "babel-plugin-debug-macros", {
					flags: [{
						source: "ember-compatibility-helpers",
						flags: {
							DEBUG: false,
							HAS_UNDERSCORE_ACTIONS: !gte( emberVersion, "2.0.0" ),
							HAS_MODERN_FACTORY_INJECTIONS: gte( emberVersion, "2.13.0" ),
							HAS_DESCRIPTOR_TRAP: satisfies( emberVersion, "~3.0.0" ),
							HAS_NATIVE_COMPUTED_GETTERS: gte( emberVersion, "3.1.0-beta.1" ),
							IS_GLIMMER_2: gte( emberVersion, "2.10.0" ),
							SUPPORTS_FACTORY_FOR: gte( emberVersion, "2.12.0" ),
							//|| 'ember-factory-for-polyfill' .gte('1.0.0'),
							SUPPORTS_GET_OWNER: gte( emberVersion, "2.3.0" ),
							//|| 'ember-getowner-polyfill' .gte('1.1.0'),
							SUPPORTS_SET_OWNER: gte( emberVersion, "2.3.0" ),
							SUPPORTS_NEW_COMPUTED: gte( emberVersion, "1.12.0-beta.1" ),
							SUPPORTS_INVERSE_BLOCK: gte( emberVersion, "1.13.0" ),
							SUPPORTS_CLOSURE_ACTIONS: gte( emberVersion, "1.13.0" ),
							SUPPORTS_UNIQ_BY_COMPUTED: gte( emberVersion, "2.7.0" )
						}
					}],
					externalizeHelpers: {
						global: "Ember"
					},
					debugTools: {
						isDebug: false,
						source: "ember-compatibility-helpers",
						assertPredicateIndex: 1
					}
				} ]
			]
		})
	});

	config.plugins.push(
		// replacement for ember-cli module that gives modules access to build flags
		new webpack.NormalModuleReplacementPlugin(
			/ember-get-config/,
			r( pRoot, "web_modules", "ember-get-config.js" )
		)
	);
};
