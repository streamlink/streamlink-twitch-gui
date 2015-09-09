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
		}
	});

});
