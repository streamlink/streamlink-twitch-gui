import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchCommunity";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			twitchCommunity: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		// rename owner_id property
		resourceHash[ "owner" ] = resourceHash[ "owner_id" ];
		delete resourceHash[ "owner_id" ];

		return this._super( modelClass, resourceHash, prop );
	}
});
