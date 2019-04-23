import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchGameSerializer extends TwitchSerializer {
	primaryKey = "name";

	modelNameFromPayloadKey = () => "twitch-game";

	attrs = {
		box: { deserialize: "records" },
		logo: { deserialize: "records" }
	};

	normalize( modelClass, resourceHash, prop ) {
		const id = resourceHash[ this.primaryKey ];
		const foreignKey = this.store.serializerFor( "twitch-image" ).primaryKey;

		// apply the id of this record to the embedded TwitchImage records (box and logo)
		if ( resourceHash.box ) {
			resourceHash.box[ foreignKey ] = `game/box/${id}`;
		}
		if ( resourceHash.logo ) {
			resourceHash.logo[ foreignKey ] = `game/logo/${id}`;
		}

		return super.normalize( modelClass, resourceHash, prop );
	}
}
