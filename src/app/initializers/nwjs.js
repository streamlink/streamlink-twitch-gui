import {
	get,
	Application
} from "ember";
import nwApp from "nwjs/App";
import nwWindow, {
	setShowInTaskbar,
	toggleMaximize,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import resetWindow from "nwjs/Window/reset";
import {
	setShowInTray,
	hideOnClick
} from "nwjs/Tray";
import {
	argv,
	parseCommand,
	ARG_TRAY,
	ARG_MIN,
	ARG_MAX,
	ARG_RESET_WINDOW,
	ARG_LAUNCH,
	ARG_GOTO
} from "nwjs/argv";
import platformfixes from "./nwjs/platformfixes";
import { createNativeMenuBar } from "./nwjs/menubar";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "NWjs EmberJS initializer" );


function onChangeIntegrations( settings ) {
	const taskbar = get( settings, "isVisibleInTaskbar" );
	const tray = get( settings, "isVisibleInTray" );

	setShowInTaskbar( taskbar );
	setShowInTray( tray, taskbar );
}

function setupIntegrations( settings ) {
	// maximize window
	if ( argv[ ARG_MAX ] ) {
		toggleMaximize( false );
	}

	// minimize window
	if ( argv[ ARG_MIN ] ) {
		toggleMinimize( false );
	}

	if ( argv[ ARG_TRAY ] ) {
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
		const nwjsService = application.lookup( "service:nwjs" );
		const routingService = application.lookup( "service:-routing" );
		const settings = application.lookup( "service:settings" );

		// set up everything NWjs related
		function settingsObserver() {
			// wait for the settings to load
			if ( !get( settings, "content" ) ) { return; }
			settings.removeObserver( "content", settings, settingsObserver );

			// try to fix issues on certain platforms first
			platformfixes();

			// initialize all the NWjs stuff
			createNativeMenuBar( routingService );
			setupIntegrations( settings );
		}

		settings.addObserver( "content", settings, settingsObserver );

		// react to secondary application launch attempts
		nwApp.on( "open", async command => {
			if ( !get( settings, "advanced" ) || !get( settings, "gui_externalcommands" ) ) {
				return;
			}
			const argv = parseCommand( command );

			await logDebug( "Received parameters from new application instance", () => argv );

			try {
				if ( argv[ ARG_RESET_WINDOW ] ) {
					await resetWindow( true );
				}
				// go to a new route (or refresh current one)
				if ( argv[ ARG_GOTO ] ) {
					await routingService.transitionTo( argv[ ARG_GOTO ] );
				}
				// launch a stream by user name
				if ( argv[ ARG_LAUNCH ] ) {
					const store = application.lookup( "service:store" );
					const streamingService = application.lookup( "service:streaming" );
					const user = await store.findRecord( "twitchUser", argv[ ARG_LAUNCH ] );
					const twitchStream = await get( user, "stream" );
					streamingService.startStream( twitchStream );
				}
			} catch ( error ) {
				await logError( error );
			}
		});

		// listen for the close event and show the dialog instead of strictly shutting down
		nwWindow.on( "close", function() {
			if ( location.pathname !== "/index.html" ) {
				return nwWindow.close( true );
			}

			try {
				nwWindow.show();
				nwWindow.focus();
				nwjsService.close();
			} catch ( e ) {
				nwWindow.close( true );
			}
		});
	}
});
