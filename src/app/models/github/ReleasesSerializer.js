import { RESTSerializer } from "EmberData";


export default RESTSerializer.extend({
	modelNameFromPayloadKey() {
		return "githubReleases";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			githubReleases: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
