const { resolve: r } = require( "path" );
const { pDependencies, pCacheBabel } = require( "../../paths" );
const { "ember-source": emberVersion } = require( "../../../../../package.json" ).dependencies;

const { gte, satisfies } = require( "semver" );


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
		options: {
			cacheDirectory: pCacheBabel,
			presets: [],
			plugins: [
				[ require( "ember-compatibility-helpers/comparision-plugin" ), {
					emberVersion
				} ],
				[ require( "babel-plugin-debug-macros" ), {
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
		}
	});
};
