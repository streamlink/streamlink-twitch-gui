import {
	get,
	set,
	inject,
	Controller
} from "Ember";
import { set as setClipboard } from "nwjs/clipboard";


const { service } = inject;


export default Controller.extend({
	auth: service(),
	notification: service(),
	settings: service(),

	scope: function() {
		return get( this, "auth.session.scope" ).split( "+" ).join( ", " );
	}.property( "auth.session.scope" ),

	showTokenForm: false,

	actions: {
		"signout": function() {
			get( this, "auth" ).signout()
				.then(function() {
					this.transitionToRoute( "user.auth" );
				}.bind( this ) );
		},

		"copyToken": function( success, failure ) {
			setClipboard( get( this, "auth.session.access_token" ) )
				.then( success, failure )
				.catch(function() {});
		},

		"showTokenForm": function() {
			set( this, "showTokenForm", true );
		}
	}
});
