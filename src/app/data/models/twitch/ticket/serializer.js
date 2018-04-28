import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchTicket";
	},

	attrs: {
		product: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash ) {
		let foreignKey = this.store.serializerFor( "twitchProduct" ).primaryKey;

		// copy the ticket's id to the product
		if ( resourceHash.product ) {
			resourceHash.product[ foreignKey ] = resourceHash[ this.primaryKey ];
		}

		return this._super( ...arguments );
	}
});
