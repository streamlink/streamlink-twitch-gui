import { get } from "Ember";
import nwWindow from "nwjs/nwWindow";
import {
	max as argMax,
	min as argMin,
	tray as argTray
} from "nwjs/argv";


export function setupIntegrations( settings ) {
	// read from settings first
	onChangeIntegrations( settings );

	// then process launch parameters

	if ( argMax ) {
		// maximize window
		nwWindow.toggleMaximize( false );
	}

	if ( argMin ) {
		// minimize window
		nwWindow.toggleMinimize( false );
	}

	if ( argTray ) {
		// show tray icon (and taskbar item)
		nwWindow.setShowInTray( true, get( settings, "isVisibleInTaskbar" ) );
		// remove the tray icon after clicking it if it's disabled in the settings
		if ( !get( settings, "isVisibleInTray" ) ) {
			nwWindow.tray.removeOnClick();
		}
	} else {
		// show application window
		nwWindow.toggleVisibility( true );
	}

	nwWindow.window.initialized = true;

	// listen for changes to integration settings
	settings.addObserver( "gui_integration", settings, onChangeIntegrations );
}

function onChangeIntegrations( settings ) {
	var taskbar = get( settings, "isVisibleInTaskbar" );
	var tray    = get( settings, "isVisibleInTray" );

	nwWindow.setShowInTaskbar( taskbar );
	nwWindow.setShowInTray( tray, taskbar );
}
