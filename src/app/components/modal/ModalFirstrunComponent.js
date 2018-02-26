import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { main as config } from "config";
import ModalDialogComponent from "./ModalDialogComponent";
import layout from "templates/components/modal/ModalFirstrunComponent.hbs";


export default ModalDialogComponent.extend({
	routing: service( "-routing" ),
	versioncheck: service(),

	layout,

	"class": "modal-firstrun",

	config,


	actions: {
		settings() {
			get( this, "routing" ).transitionTo( "settings" );
			this.send( "start" );
		},

		start() {
			this.send( "close" );
			get( this, "versioncheck" ).checkForNewRelease();
		}
	}
});
