import { update as updateConfig } from "config";
import CustomRESTAdapter from "data/models/-adapters/custom-rest";


const { githubreleases: { host, namespace } } = updateConfig;


export default class GithubReleasesAdapter extends CustomRESTAdapter {
	host = host;
	namespace = namespace;

	queryRecord( store, type, query ) {
		const url = this.buildURL( type, null, null, "queryRecord", query );

		return this.ajax( url, "GET", { data: {} } );
	}

	urlForQueryRecord( query, modelName ) {
		return this._buildURL( modelName, query );
	}
}
