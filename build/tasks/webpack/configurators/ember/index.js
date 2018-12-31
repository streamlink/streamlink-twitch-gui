function buildEmberConfig( config, isProd ) {
	require( "./app" )( config, isProd );
	require( "./source" )( config, isProd );
	require( "./compatibility-helpers" )( config, isProd );
	require( "./data" )( config, isProd );
	require( "./decorators" )( config, isProd );
	require( "./i18n" )( config, isProd );
	require( "./tests" )( config );
}


/**
 * Configurations for EmberJS, EmberData, Ember-Addons and everything else related to them.
 */
module.exports = {
	dev( config ) {
		buildEmberConfig( config, false );
	},

	test( config ) {
		buildEmberConfig( config, false );
	},

	testdev( config ) {
		buildEmberConfig( config, false );
	},

	coverage( config ) {
		buildEmberConfig( config, false );
	},

	prod( config ) {
		buildEmberConfig( config, true );
	}
};
