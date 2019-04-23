import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchChannelFollowedSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-channel-followed";

	attrs = {
		channel: { deserialize: "records" }
	};

	normalizeArrayResponse( store, primaryModelClass, payload, id, requestType ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// fix payload format
		const follows = ( payload.follows /* istanbul ignore next */ || [] );
		delete payload.follows;
		payload[ this.modelNameFromPayloadKey() ] = follows.map( data => {
			data[ this.primaryKey ] = data.channel[ foreignKey ];
			return data;
		});

		return super.normalizeArrayResponse( store, primaryModelClass, payload, id, requestType );
	}

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// fix payload format
		payload[ this.primaryKey ] = payload.channel[ foreignKey ];
		delete payload.channel;
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeSingleResponse( store, primaryModelClass, payload, id, requestType );
	}
}
