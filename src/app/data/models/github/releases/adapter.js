import RESTAdapter from "ember-data/adapters/rest";
import { update as config } from "config";
import AdapterMixin from "store/AdapterMixin";


const { githubreleases: { host, namespace } } = config;


export default RESTAdapter.extend( AdapterMixin, {
	host,
	namespace
});
