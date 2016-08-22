import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchChannelsFollowed";
		},

		attrs: {
			channel: { deserialize: "records" }
		},

		normalize: function( modelClass, resourceHash, prop ) {
			var foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;
			resourceHash[ this.primaryKey ] = resourceHash.channel[ foreignKey ];

			return this._super( modelClass, resourceHash, prop );
		}
	});
