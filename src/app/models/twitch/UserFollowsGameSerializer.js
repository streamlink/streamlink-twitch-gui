import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchUserFollowsGame";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		const primaryKey = this.primaryKey;

		// fix payload format
		payload = {
			twitchUserFollowsGame: !payload || !payload[ primaryKey ]
				? null
				: { [ primaryKey ]: payload[ primaryKey ] }
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
