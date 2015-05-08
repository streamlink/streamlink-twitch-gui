define([
	"ember",
	"ember-data",
	"store/AdapterMixin"
], function( Ember, DS, AdapterMixin ) {

	var reURLFragment = /^:(.+)$/;

	return DS.RESTAdapter.extend( AdapterMixin, {
		auth: Ember.inject.service(),

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
		}.observes( "access_token" ),


		createRecordMethod: "PUT",
		createRecordData: function() {
			// we don't need to send any data with the request (yet?)
			return {};
		},

		updateRecordData: function() {
			// we don't need to send any data with the request (yet?)
			return {};
		},

		buildURLFragments: function( url ) {
			var adapter = this;
			return this._super( url ).map(function( frag ) {
				return frag.replace( reURLFragment, function( _, key ) {
					switch ( key ) {
						// a user fragment requires the user to be logged in
						case "user":
							var user = adapter.get( "auth.session.user_name" );
							if ( !user ) { throw new Error( "Unknown user" ); }
							return user;
						// unknown fragment
						default:
							throw new Error( "Unknown URL fragment: " + key );
					}
				});
			});
		}
	});

});
