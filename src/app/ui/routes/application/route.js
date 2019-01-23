import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	versioncheck: service(),

	init() {
		this._super( ...arguments );
		this.versioncheck.check();
	}
});
