import { inject as service } from "@ember/service";
import { main as mainConfig } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend( /** @class ModalFirstrunComponent */ {
	/** @type {RouterService} */
	router: service(),

	layout,
	classNames: [ "modal-firstrun-component" ],

	name: mainConfig[ "display-name" ],


	actions: {
		/** @this {ModalFirstrunComponent} */
		settings() {
			this.router.transitionTo( "settings" );
			this.send( "close" );
		}
	}
});
