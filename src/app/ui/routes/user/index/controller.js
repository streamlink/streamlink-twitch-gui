import Controller from "@ember/controller";
import { set, computed } from "@ember/object";
import { inject as service } from "@ember/service";


export default Controller.extend({
	/** @type {AuthService} */
	auth: service(),
	/** @type {NotificationService} */
	notification: service(),
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),
	/** @type {SettingsService} */
	settings: service(),

	scope: computed( "auth.session.scope", function() {
		const { session } = this.auth;

		return session && session.scope
			? session.scope.split( "+" ).join( ", " )
			: "";
	}),

	showTokenForm: false,

	actions: {
		async signout() {
			await this.auth.signout();
			this.router.transitionTo( "user.auth" );
		},

		async copyToken( success, failure ) {
			try {
				this.nwjs.clipboard.set( this.auth.session.access_token );
				await success();
			} catch ( err ) {
				await failure( err );
			}
		},

		showTokenForm() {
			set( this, "showTokenForm", true );
		}
	}
});
