import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchUserFollowsGame";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		var primaryKey = this.primaryKey;

		if ( !payload || !payload[ primaryKey ] ) {
			payload = {};
		}

		var record = {};
		record[ primaryKey ] = payload[ primaryKey ];

		// return an empty payload (ignore all properties)
		payload = {
			twitchUserFollowsGame: [ record ]
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
