import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { main as config } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend({
	/** @type {RouterService} */
	router: service(),
	versioncheck: service(),

	layout,

	"class": "modal-firstrun",

	config,


	actions: {
		settings() {
			this.router.transitionTo( "settings" );
			this.send( "start" );
		},

		start() {
			this.send( "close" );
			get( this, "versioncheck" ).checkForNewRelease();
		}
	}
});
