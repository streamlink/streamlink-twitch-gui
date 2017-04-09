import {
	get,
	computed,
	inject
} from "ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import HotkeyMixin from "mixins/HotkeyMixin";
import nwWindow from "nwjs/Window";
import layout from "templates/components/modal/ModalQuitComponent.hbs";


const { readOnly } = computed;
const { service } = inject;


export default ModalDialogComponent.extend( HotkeyMixin, {
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
			nwWindow.close( true );
		}
	}
});
