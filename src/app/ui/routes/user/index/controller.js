import Controller from "@ember/controller";
import { set, computed, action } from "@ember/object";
import { inject as service } from "@ember/service";


export default class UserIndexController extends Controller {
	/** @type {AuthService} */
	@service auth;
	/** @type {NotificationService} */
	@service notification;
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {RouterService} */
	@service router;
	/** @type {SettingsService} */
	@service settings;

	isTokenFormVisible = false;

	@computed( "auth.session.scope" )
	get scope() {
		/** @type {Auth} */
		const { session } = this.auth;

		return session && session.scope
			? session.scope.split( "+" ).join( ", " )
			: "";
	}

	@action
	async signout() {
		await this.auth.signout();
		this.router.transitionTo( "user.auth" );
	}

	@action
	async copyToken( success, failure ) {
		try {
			this.nwjs.clipboard.set( this.auth.session.access_token );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}

	@action
	showTokenForm() {
		set( this, "isTokenFormVisible", true );
	}
}
