import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchGameTopSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-game-top";

	attrs = {
		game: { deserialize: "records" }
	};

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-game" ).primaryKey;

		// get the id of the embedded TwitchGame record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return super.normalize( modelClass, resourceHash, prop );
	}
}
