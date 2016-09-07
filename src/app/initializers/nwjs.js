import {
	get,
	Application
} from "Ember";
import nwWindow from "nwjs/nwWindow";
import platformfixes from "nwjs/setup/platformfixes";
import { createNativeMenuBar } from "nwjs/setup/menubar";
import { createStartmenuShortcut } from "nwjs/setup/shortcut";
import { createTrayIcon } from "nwjs/setup/tray";
import { setupIntegrations } from "nwjs/setup/integrations";


Application.instanceInitializer({
	name: "nwjs",

	initialize( application ) {
		var controller = application.lookup( "controller:application" );
		var settings   = application.lookup( "service:settings" );

		// set up everything NWjs related
		nwWindow.once( "ready", function() {
			function settingsObserver() {
				// wait for the settings to load
				if ( !get( settings, "content" ) ) { return; }
				settings.removeObserver( "content", settings, settingsObserver );

				// try to fix issues on certain platforms first
				platformfixes();

				// do all the NWjs stuff
				createNativeMenuBar( controller );
				createStartmenuShortcut( settings );
				createTrayIcon( settings );
				setupIntegrations( settings );
			}

			settings.addObserver( "content", settings, settingsObserver );
		});

		// listen for the close event and show the dialog instead of strictly shutting down
		nwWindow.on( "close", function() {
			if ( location.pathname !== "/index.html" ) {
				return nwWindow.close( true );
			}

			try {
				nwWindow.show();
				nwWindow.focus();
				controller.send( "winClose" );
			} catch ( e ) {
				nwWindow.close( true );
			}
		});
	}
});
