import {
	get,
	computed,
	inject
} from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import nwWindow from "nwjs/Window";
import layout from "templates/components/modal/ModalQuitComponent.hbs";


const { readOnly } = computed;
const { service } = inject;


export default ModalDialogComponent.extend({
	streamservice: service( "stream" ),

	layout,

	"class": "modal-quit",

	hasStreams: readOnly( "streamservice.model.length" ),


	actions: {
		shutdown() {
			get( this, "streamservice" ).killAll();
			this.send( "quit" );
		},

		quit() {
			nwWindow.close( true );
		}
	}
});
