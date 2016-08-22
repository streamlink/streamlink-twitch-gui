import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchSearchGame";
		},

		attrs: {
			game: { deserialize: "records" }
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			payload.games = ( payload.games || [] ).map(function( hash ) {
				return {
					game: hash
				};
			});

			return this._super( store, primaryModelClass, payload, id, requestType );
		},

		normalize: function( modelClass, resourceHash, prop ) {
			var foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;
			resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

			return this._super( modelClass, resourceHash, prop );
		}
	});
