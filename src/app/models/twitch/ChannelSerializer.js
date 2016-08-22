import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		primaryKey: "name",

		modelNameFromPayloadKey: function() {
			return "twitchChannel";
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

				// also remove the teams property for now
				delete resourceHash.teams;
			}

			return this._super( modelClass, resourceHash, prop );
		}
	});
