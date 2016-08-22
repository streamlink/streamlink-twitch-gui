import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		normalizeResponse: function( store, primaryModelClass, payload, id, requestType ) {
			payload[ this.primaryKey ] = 1;
			payload = {
				twitchStreamsSummaries: [ payload ]
			};

			return this._super( store, primaryModelClass, payload, id, requestType );
		}
	});
