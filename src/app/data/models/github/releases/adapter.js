import RESTAdapter from "ember-data/adapters/rest";
import { update as updateConfig } from "config";
import AdapterMixin from "data/models/-mixins/adapter";


const { githubreleases: { host, namespace } } = updateConfig;


export default RESTAdapter.extend( AdapterMixin, {
	host,
	namespace,

	queryRecord( store, type, query ) {
		const url = this.buildURL( type, null, null, "queryRecord", query );

		return this.ajax( url, "GET", { data: {} } );
	},

	urlForQueryRecord( query, modelName ) {
		return this._buildURL( modelName, query );
	}
});
