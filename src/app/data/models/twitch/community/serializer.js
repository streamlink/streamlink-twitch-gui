import TwitchSerializer from "data/models/twitch/serializer";


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
		// rename properties
		resourceHash[ "owner" ] = resourceHash[ "owner_id" ];
		delete resourceHash[ "owner_id" ];

		resourceHash[ "description" ] = resourceHash[ "description_html" ];
		delete resourceHash[ "description_html" ];

		resourceHash[ "rules" ] = resourceHash[ "rules_html" ];
		delete resourceHash[ "rules_html" ];

		// fix language format
		resourceHash[ "language" ] = ( resourceHash[ "language" ] || "" ).toLowerCase();

		return this._super( modelClass, resourceHash, prop );
	}
});
