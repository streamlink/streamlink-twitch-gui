import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	/** @type {AuthService} */
	auth: service(),
	/** @type {VersioncheckService} */
	versioncheck: service(),

	init() {
		this._super( ...arguments );
		this.auth.autoLogin();
		this.versioncheck.check();
	}
});
