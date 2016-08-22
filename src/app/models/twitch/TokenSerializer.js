import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchToken";
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			// add an ID to the token record and fix the payload format
			payload.token[ this.primaryKey ] = 1;
			payload = {
				twitchToken: [ payload.token ]
			};

			return this._super( store, primaryModelClass, payload, id, requestType );
		}
	});
