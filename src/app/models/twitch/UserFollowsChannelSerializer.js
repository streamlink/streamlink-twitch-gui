import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		primaryKey: "id",

		modelNameFromPayloadKey: function() {
			return "twitchUserFollowsChannel";
		},

		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			// unexpected payload
			if ( !payload.follows ) {
				var primaryKey = this.primaryKey;
				if ( !payload[ primaryKey ] ) {
					payload[ primaryKey ] = id;
				}

				delete payload.channel;

				payload = {
					follows: payload
				};
			}

			return this._super( store, primaryModelClass, payload, id, requestType );
		},

		normalize: function( modelClass, resourceHash, prop ) {
			var primaryKey = this.primaryKey;
			if ( !resourceHash[ primaryKey ] ) {
				var foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;
				resourceHash[ primaryKey ] = resourceHash.channel[ foreignKey ];
			}

			return this._super( modelClass, resourceHash, prop );
		}
	});
