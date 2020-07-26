import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchUser";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			[ this.modelNameFromPayloadKey() ]: ( payload.users /* istanbul ignore next */ || [] )
				.map( user => ({
					[ this.primaryKey ]: user.name,
					channel: user._id,
					stream: user._id
				}) )
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalizeFindRecordResponse( store, primaryModelClass, payload, id, requestType ) {
		const key = this.modelNameFromPayloadKey();
		payload[ key ] = payload[ key ][0] /* istanbul ignore next */ || null;

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalizeQueryRecordResponse( ...args ) {
		return this.normalizeFindRecordResponse( ...args );
	}
});
