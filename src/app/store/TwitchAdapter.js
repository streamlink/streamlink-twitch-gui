import Ember from "Ember";
import DS from "EmberData";
import config from "config";
import AdapterMixin from "store/AdapterMixin";


	var get = Ember.get;

	var oauth = config.twitch[ "oauth" ];

	var reURLFragment = /^:(.+)$/;


	export default DS.RESTAdapter.extend( AdapterMixin, {
		auth: Ember.inject.service(),

		host: "https://api.twitch.tv",
		namespace: "",
		headers: {
			"Accept": "application/vnd.twitchtv.v3+json",
			"Client-ID": oauth[ "client-id" ]
		},

		defaultSerializer: "twitch",

		access_token: null,
		tokenObserver: function() {
			var token = get( this, "access_token" );
			if ( token === null ) {
				delete this.headers[ "Authorization" ];
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


		/**
		 * Dynamic URL fragments
		 * @param {DS.Model} type
		 * @param {string?} id
		 * @returns {string[]}
		 */
		buildURLFragments: function( type, id ) {
			var adapter = this;
			var idFound = false;

			var path = type.toString();
			var url  = path.split( "/" );

			url = url.map(function( frag ) {
				return frag.replace( reURLFragment, function( _, key ) {
					switch ( key ) {
						case "id":
							if ( Ember.isNone( id ) ) { throw new Error( "Unknown ID" ); }
							idFound = true;
							return id;
						// a user fragment requires the user to be logged in
						case "user":
							var user = get( adapter, "auth.session.user_name" );
							if ( !user ) { throw new Error( "Unknown user" ); }
							return user;
						// unknown fragment
						default:
							throw new Error( "Unknown URL fragment: " + key );
					}
				});
			});

			if ( !idFound && !Ember.isNone( id ) ) {
				url.push( id );
			}

			return url;
		}
	});
