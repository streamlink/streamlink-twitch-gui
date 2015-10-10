define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		modelNameFromPayloadKey: function() {
			return "twitchChannel";
		},

		attrs : {
			teams: { deserialize: "records" }
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			payload = {
				twitchChannel: payload
			};

			return this._super( store, primaryModelClass, payload, id, requestType );
		},

		normalize: function( modelClass, resourceHash, prop ) {
			// Twitch.tv API bug?
			// Sometimes a user record (/user/:user - model not implemented) is embedded into
			// a stream record instead of a channels record (/channels/:channel - the current model)
			if ( resourceHash ) {
				delete resourceHash.bio;
				delete resourceHash.type;
			}

			return this._super( modelClass, resourceHash, prop );
		}
	});

});
