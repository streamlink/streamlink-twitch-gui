import GameSerializer from "models/twitch/GameSerializer";


export default GameSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchGameFollowed";
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			twitchGameFollowed: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
