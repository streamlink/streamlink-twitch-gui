import {
	get,
	computed,
	inject,
	Controller
} from "Ember";
import nwWindow from "nwjs/nwWindow";


const { readOnly } = computed;
const { service } = inject;


export default Controller.extend({
	auth: service(),
	livestreamer: service(),
	modal: service(),
	notification: service(),
	settings: service(),

	dev: DEBUG,

	streamsLength: readOnly( "livestreamer.model.length" ),

	nl: "\n",


	actions: {
		winRefresh() {
			nwWindow.reloadIgnoringCache();
		},

		winDevTools() {
			nwWindow.showDevTools();
		},

		winMin() {
			var integration    = get( this, "settings.gui_integration" );
			var minimizetotray = get( this, "settings.gui_minimizetotray" );

			// tray only or both with min2tray: just hide the window
			if ( integration === 2 || integration === 3 && minimizetotray ) {
				nwWindow.toggleVisibility( false );
			} else {
				nwWindow.toggleMinimize( false );
			}
		},

		winMax() {
			nwWindow.toggleMaximize();
		},

		winClose() {
			if ( get( this, "streamsLength" ) ) {
				get( this, "modal" ).openModal( "quit", this );
			} else {
				nwWindow.close( true );
			}
		}
	}
});
