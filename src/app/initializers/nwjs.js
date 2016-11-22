import {
	get,
	Application
} from "Ember";
import nwWindow, {
	setShowInTaskbar,
	toggleMaximize,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import {
	setShowInTray,
	hideOnClick
} from "nwjs/Tray";
import {
	max as argMax,
	min as argMin,
	tray as argTray
} from "nwjs/argv";
import platformfixes from "./nwjs/platformfixes";
import { createNativeMenuBar } from "./nwjs/menubar";


function onChangeIntegrations( settings ) {
	let taskbar = get( settings, "isVisibleInTaskbar" );
	let tray    = get( settings, "isVisibleInTray" );

	setShowInTaskbar( taskbar );
	setShowInTray( tray, taskbar );
}

function setupIntegrations( settings ) {
	// maximize window
	if ( argMax ) {
		toggleMaximize( false );
	}

	// minimize window
	if ( argMin ) {
		toggleMinimize( false );
	}

	if ( argTray ) {
		// show tray icon (and taskbar item)
		setShowInTray( true, get( settings, "isVisibleInTaskbar" ) );
		// remove the tray icon after clicking it if it's disabled in the settings
		if ( !get( settings, "isVisibleInTray" ) ) {
			hideOnClick();
		}
	} else {
		// show tray and taskbar item depending on settings
		onChangeIntegrations( settings );

		// show application window
		toggleVisibility( true );
	}

	nwWindow.window.initialized = true;

	// listen for changes to integration settings
	settings.addObserver( "gui_integration", settings, onChangeIntegrations );
}


Application.instanceInitializer({
	name: "nwjs",

	initialize( application ) {
		var controller = application.lookup( "controller:application" );
		var settings   = application.lookup( "service:settings" );

		// set up everything NWjs related
		function settingsObserver() {
			// wait for the settings to load
			if ( !get( settings, "content" ) ) { return; }
			settings.removeObserver( "content", settings, settingsObserver );

			// try to fix issues on certain platforms first
			platformfixes();

			// initialize all the NWjs stuff
			createNativeMenuBar( controller );
			setupIntegrations( settings );
		}

		settings.addObserver( "content", settings, settingsObserver );

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
