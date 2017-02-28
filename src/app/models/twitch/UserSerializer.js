import TwitchSerializer from "store/TwitchSerializer";


const { isArray } = Array;


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchUser";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		if ( !payload || !isArray( payload.users ) || payload.users.length !== 1 ) {
			payload = {
				twitchUser: null
			};
		} else {
			let user = payload.users[0];
			payload = {
				twitchUser: {
					[ this.primaryKey ]: user.name,
					channel: user._id
				}
			};
		}

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
