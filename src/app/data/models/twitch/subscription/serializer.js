import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-subscription";
	},

	normalize( modelClass, resourceHash, prop ) {
		const { user_id } = resourceHash._query;
		resourceHash[ "user_id" ] = user_id;
		resourceHash[ this.primaryKey ] = `${user_id}-${resourceHash.broadcaster_id}`;

		return this._super( modelClass, resourceHash, prop );
	}
});
