import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchGame";
	},

	attrs: {
		box: { deserialize: "records" },
		logo: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		var name = resourceHash[ this.primaryKey ];
		var foreignKey = this.store.serializerFor( "twitchImage" ).primaryKey;

		if ( resourceHash.box ) {
			resourceHash.box[ foreignKey ] = `game/box/${name}`;
		}
		if ( resourceHash.logo ) {
			resourceHash.logo[ foreignKey ] = `game/logo/${name}`;
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
