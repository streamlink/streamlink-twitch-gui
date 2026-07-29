import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	// streams can only be uniquely queried by "user_id"
	// simply set the primaryKey to it and ignore the regular stream "id"
	// this allows us to reload the TwitchStream model
	// but store.findRecord will require the user_id to be set
	primaryKey: "user_id",

	modelNameFromPayloadKey() {
		return "twitch-stream";
	},

	normalize( modelClass, resourceHash, prop ) {
		const { primaryKey } = this;
		resourceHash[ "user" ] = resourceHash[ primaryKey ];
		resourceHash[ "channel" ] = resourceHash[ primaryKey ];
		// game IDs can be empty strings
		resourceHash[ "game_id" ] = resourceHash[ "game" ]
			= resourceHash[ "game_id" ] /* istanbul ignore next */ || null;
		if ( resourceHash[ "language" ] === "id" ) {
			resourceHash[ "language" ] = "ID";
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
