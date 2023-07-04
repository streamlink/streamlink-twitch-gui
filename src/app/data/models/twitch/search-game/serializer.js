import TwitchSerializer from "data/models/twitch/serializer";


const reStaticBoxArtRes = /\d{1,10}x\d{1,10}\.(\w+)$/;


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-search-game";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const { primaryKey } = this;

		// workaround for: https://github.com/twitchdev/issues/issues/329
		/* istanbul ignore next */
		if ( resourceHash[ "box_art_url" ] ) {
			resourceHash[ "box_art_url" ] = `${resourceHash[ "box_art_url" ]}`
				.replace( reStaticBoxArtRes, "{width}x{height}.$1" );
		}

		resourceHash = {
			[ primaryKey ]: resourceHash[ primaryKey ],
			game: resourceHash
		};

		return this._super( modelClass, resourceHash, prop );
	}
});
