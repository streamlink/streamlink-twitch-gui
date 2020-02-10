/**
 * Configurations for EmberJS, EmberData, Ember-Addons and everything else related to them.
 */
module.exports = {
	common( config, grunt, target ) {
		const isProd = target === "prod";

		require( "./app" )( config, grunt, isProd );
		require( "./source" )( config, grunt, isProd );
		require( "./compatibility-helpers" )( config, grunt, isProd );
		require( "./data" )( config, grunt, isProd );
		require( "./decorators" )( config, grunt, isProd );
		require( "./i18n" )( config, grunt, isProd );
		require( "./tests" )( config, grunt, isProd );
	}
};
