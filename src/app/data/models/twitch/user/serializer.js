import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchUser";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			[ this.modelNameFromPayloadKey() ]: ( payload.users || [] ).map( user => ({
				[ this.primaryKey ]: user.name,
				channel: user._id,
				stream: user._id
			}) )
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
