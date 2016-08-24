import Ember from "Ember";
import clipboard from "nwjs/clipboard";


var get = Ember.get;
var set = Ember.set;


export default Ember.Controller.extend({
	auth        : Ember.inject.service(),
	notification: Ember.inject.service(),
	settings    : Ember.inject.service(),

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
			clipboard.set( get( this, "auth.session.access_token" ) )
				.then( success, failure )
				.catch(function() {});
		},

		"showTokenForm": function() {
			set( this, "showTokenForm", true );
		}
	}
});
