import Ember from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import layout from "templates/components/modal/ModalFirstrunComponent.hbs";


var get = Ember.get;


export default ModalDialogComponent.extend({
	versioncheck: Ember.inject.service(),

	layout: layout,
	"class": "modal-firstrun",

	goto: "goto",


	actions: {
		"settings": function() {
			this.sendAction( "goto", "settings" );
			this.send( "start" );
		},

		"start": function() {
			this.send( "close" );
			get( this, "versioncheck" ).checkForNewRelease();
		}
	}
});
