import { get } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ModalDialogComponent from "./ModalDialogComponent";
import HotkeyMixin from "../mixins/hotkey";
import layout from "templates/components/modal/ModalQuitComponent.hbs";


export default ModalDialogComponent.extend( HotkeyMixin, {
	nwjs: service(),
	streaming: service(),

	layout,

	"class": "modal-quit",

	hasStreams: readOnly( "streaming.model.length" ),

	hotkeys: [
		{
			code: [ "Enter", "NumpadEnter" ],
			action: "shutdown"
		}
	],

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
