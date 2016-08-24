import Ember from "Ember";
import FormButtonComponent from "components/button/FormButtonComponent";


var get = Ember.get;


export default FormButtonComponent.extend({
	chat: Ember.inject.service(),

	"class" : "btn-hint",
	icon    : "fa-comments",
	title   : "Open chat",
	iconanim: true,

	action: "chat",

	actions: {
		"chat": function( success, failure ) {
			var channel = get( this, "channel" );
			var chat    = get( this, "chat" );
			chat.open( channel )
				.then( success, failure )
				.catch(function() {});
		}
	}
});
