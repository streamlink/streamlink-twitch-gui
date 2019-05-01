import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default class ApplicationRoute extends Route {
	/** @type {AuthService} */
	@service auth;
	/** @type {VersioncheckService} */
	@service versioncheck;

	init() {
		super.init( ...arguments );
		this.auth.autoLogin();
		this.versioncheck.check();
	}
}
