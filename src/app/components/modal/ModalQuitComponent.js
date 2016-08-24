import Ember from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import nwWindow from "nwjs/nwWindow";
import layout from "templates/components/modal/ModalQuitComponent.hbs";


var get = Ember.get;
var readOnly = Ember.computed.readOnly;


export default ModalDialogComponent.extend({
	livestreamer: Ember.inject.service(),

	layout: layout,
	"class": "modal-quit",

	hasStreams: readOnly( "livestreamer.model.length" ),


	actions: {
		"shutdown": function() {
			get( this, "livestreamer" ).killAll();
			this.send( "quit" );
		},

		"quit": function() {
			nwWindow.close( true );
		}
	}
});
