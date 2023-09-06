import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-channels-followed";
	},

	normalize( modelClass, resourceHash, prop ) {
		// see adapter for `resourceHash._query.user_id`
		resourceHash[ "user_id" ] = resourceHash._query.user_id;
		resourceHash[ this.primaryKey ] = `${resourceHash.user_id}-${resourceHash.broadcaster_id}`;

		return this._super( modelClass, resourceHash, prop );
	}
});
