define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchChannelPanel";
		},

		attrs: {
			panels: { deserialize: "records" }
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			// fix payload format
			payload = {
				twitchChannelPanel: {
					_id: id,
					panels: payload
				}
			};

			return this._super( store, primaryModelClass, payload, id, requestType );
		}
	});

});
