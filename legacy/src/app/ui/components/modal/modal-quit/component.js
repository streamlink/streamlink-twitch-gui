import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend({
	nwjs: service(),
	streaming: service(),

	layout,

	classNames: [ "modal-quit-component" ],

	hasStreams: readOnly( "streaming.hasStreams" ),

	hotkeysNamespace: "modalquit",
	hotkeys: {
		shutdown: "shutdown"
	},

	actions: {
		shutdown() {
			this.streaming.killAll();
			this.send( "quit" );
		},

		quit() {
			this.nwjs.quit();
		}
	}
});
