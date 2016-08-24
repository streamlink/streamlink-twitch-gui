import Ember from "Ember";
import nwWindow from "nwjs/nwWindow";
import platformfixes from "nwjs/setup/platformfixes";
import menubar from "nwjs/setup/menubar";
import shortcut from "nwjs/setup/shortcut";
import tray from "nwjs/setup/tray";
import integrations from "nwjs/setup/integrations";


var get = Ember.get;


Ember.Application.instanceInitializer({
	name: "nwjs",

	initialize: function( application ) {
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
				menubar.createNativeMenuBar( controller );
				shortcut.createStartmenuShortcut( settings );
				tray.createTrayIcon( settings );
				integrations.setupIntegrations( settings );
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
