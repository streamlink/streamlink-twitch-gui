import {
	get,
	set,
	computed,
	inject,
	Controller
} from "ember";
import { set as setClipboard } from "nwjs/Clipboard";


const { service } = inject;


export default Controller.extend({
	auth: service(),
	notification: service(),
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

		copyToken( success, failure ) {
			setClipboard( get( this, "auth.session.access_token" ) )
				.then( success, failure )
				.catch( () => {} );
		},

		showTokenForm() {
			set( this, "showTokenForm", true );
		}
	}
});
