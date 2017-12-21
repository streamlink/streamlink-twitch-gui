import {
	get,
	inject,
	Service
} from "ember";
import { quit } from "nwjs/App";
import nwWindow, {
	toggleVisibility,
	toggleMaximized,
	toggleMinimized
} from "nwjs/Window";
import {
	ATTR_GUI_INTEGRATION_TRAY,
	ATTR_GUI_INTEGRATION_BOTH
} from "models/localstorage/Settings/gui";


const { service } = inject;


export default Service.extend({
	modal: service(),
	settings: service(),
	streaming: service(),


	reload() {
		nwWindow.reloadIgnoringCache();
	},

	devTools() {
		nwWindow.showDevTools();
	},

	minimize() {
		const integration = get( this, "settings.gui.integration" );
		const minimizetotray = get( this, "settings.gui.minimizetotray" );

		// hide the window when in tray-only-mode or in both-mode with min2tray setting enabled
		if (
			   integration === ATTR_GUI_INTEGRATION_TRAY
			|| integration === ATTR_GUI_INTEGRATION_BOTH
			&& minimizetotray
		) {
			toggleVisibility();
		} else {
			toggleMinimized();
		}
	},

	maximize() {
		toggleMaximized();
	},

	close() {
		const streams = get( this, "streaming.model" ).toArray();
		if ( streams.length && streams.some( stream => !get( stream, "hasEnded" ) ) ) {
			get( this, "modal" ).openModal( "quit", this );
		} else {
			this.quit();
		}
	},

	quit() {
		quit();
	}
});
