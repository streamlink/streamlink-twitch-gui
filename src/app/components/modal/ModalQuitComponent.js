import {
	get,
	computed,
	inject
} from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import nwWindow from "nwjs/nwWindow";
import layout from "templates/components/modal/ModalQuitComponent.hbs";


const { readOnly } = computed;
const { service } = inject;


export default ModalDialogComponent.extend({
	livestreamer: service(),

	layout,

	"class": "modal-quit",

	hasStreams: readOnly( "livestreamer.model.length" ),


	actions: {
		shutdown() {
			get( this, "livestreamer" ).killAll();
			this.send( "quit" );
		},

		quit() {
			nwWindow.close( true );
		}
	}
});
