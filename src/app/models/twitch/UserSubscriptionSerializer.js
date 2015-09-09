define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchUserSubscription";
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			var foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;
			payload[ this.primaryKey ] = payload.channel[ foreignKey ];
			payload.channel = null;

			payload = {
				twitchUserSubscription: payload
			};

			return this._super( store, primaryModelClass, payload, id, requestType );
		}
	});

});
