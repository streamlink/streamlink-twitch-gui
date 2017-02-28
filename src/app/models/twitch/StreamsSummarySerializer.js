import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// always use 1 as id
		payload[ this.primaryKey ] = 1;

		// fix payload format
		payload = {
			twitchStreamsSummary: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
