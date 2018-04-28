import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchChannelPanel";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			twitchChannelPanel: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		const data = resourceHash.data;
		if ( data ) {
			resourceHash.title = data.title;
			resourceHash.image = data.image;
			resourceHash.link = data.link;
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
