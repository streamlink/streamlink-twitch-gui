define([
	"ember",
	"ember-data",
	"store/AdapterMixin"
], function( Ember, DS, AdapterMixin ) {

	return DS.RESTAdapter.extend( AdapterMixin, {
		host: "https://api.twitch.tv",
		namespace: "kraken",
		headers: {
			Accept: "application/vnd.twitchtv.v3+json"
		},

		defaultSerializer: "twitch",

		access_token: null,
		tokenObserver: function() {
			var token = this.get( "access_token" );
			if ( token === null ) {
				delete this.headers[ token ];
			} else {
				this.headers[ "Authorization" ] = "OAuth " + token;
			}
		}.observes( "access_token" )
	});

});
