import { get } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend({
	nwjs: service(),
	streaming: service(),

	layout,

	"class": "modal-quit",

	hasStreams: readOnly( "streaming.model.length" ),

	hotkeysNamespace: "modalquit",
	hotkeys: {
		shutdown: "shutdown"
	},

	actions: {
		shutdown() {
			get( this, "streaming" ).killAll();
			this.send( "quit" );
		},

		quit() {
			get( this, "nwjs" ).quit();
		}
	}
});
