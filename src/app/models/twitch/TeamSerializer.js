import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchTeam";
	},

	attrs: {
		users: { deserialize: "records" }
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		// fix payload format
		//if ( !resourceHash.users ) {
		//	resourceHash.users = [];
		//}

		return this._super( modelClass, resourceHash, prop );
	}
});
