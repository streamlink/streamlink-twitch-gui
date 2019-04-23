import RESTSerializer from "ember-data/serializers/rest";


export default class GithubReleasesSerializer extends RESTSerializer {
	modelNameFromPayloadKey = () => "github-releases";

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}
}
