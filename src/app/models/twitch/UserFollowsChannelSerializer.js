import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchUserFollowsChannel";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// set the primary key to the requested record id
		const primaryKey = this.primaryKey;
		if ( !payload[ primaryKey ] ) {
			payload[ primaryKey ] = id;
		}

		// fix payload format
		payload = {
			twitchUserFollowsChannel: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
