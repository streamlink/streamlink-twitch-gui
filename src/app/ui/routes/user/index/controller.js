import Controller from "@ember/controller";
import { get, set, computed } from "@ember/object";
import { inject as service } from "@ember/service";


export default Controller.extend({
	auth: service(),
	notification: service(),
	/** @type {NwjsService} */
	nwjs: service(),
	settings: service(),

	scope: computed( "auth.session.scope", function() {
		return get( this, "auth.session.scope" ).split( "+" ).join( ", " );
	}),

	showTokenForm: false,

	actions: {
		signout() {
			get( this, "auth" ).signout()
				.then( () => this.transitionToRoute( "user.auth" ) );
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
