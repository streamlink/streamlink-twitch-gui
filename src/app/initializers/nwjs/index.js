import {
	get,
	Application
} from "ember";
import nwApp from "nwjs/App";
import nwWindow, {
	setVisibility,
	setFocused
} from "nwjs/Window";
import {
	argv,
	parseCommand
} from "nwjs/argv";
import platformfixes from "./platformfixes";
import { createNativeMenuBar } from "./menubar";
import onChangeIntegrations from "./integrations";
import parameterActions from "./parameters";
import windowInitializer from "./window";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "NWjs EmberJS initializer" );


Application.instanceInitializer({
	name: "nwjs",

	initialize( application ) {
		const nwjsService = application.lookup( "service:nwjs" );
		const routingService = application.lookup( "service:-routing" );
		const settings = application.lookup( "service:settings" );

		// initialize all the NWjs stuff
		settings.one( "initialized", async () => {
			// try to fix issues on certain platforms first
			platformfixes();

			createNativeMenuBar( routingService );

			// restore window position first (while being hidden)
			await windowInitializer( application );

			try {
				await parameterActions( argv, settings, application );
			} catch ( error ) {
				await logError( error );
			}

			// listen for changes to integration settings
			settings.addObserver( "gui_integration", settings, onChangeIntegrations );

			nwWindow.window.initialized = true;
		});

		// react to secondary application launch attempts
		nwApp.on( "open", async command => {
			if ( !get( settings, "advanced" ) || !get( settings, "gui_externalcommands" ) ) {
				return;
			}
			const argv = parseCommand( command );

			await logDebug( "Received parameters from new application instance", () => argv );

			try {
				await parameterActions( argv, settings, application );
			} catch ( error ) {
				await logError( error );
			}
		});

		// listen for the close event and show the dialog instead of strictly shutting down
		nwWindow.on( "close", function() {
			if ( location.pathname !== "/index.html" ) {
				return nwApp.quit();
			}

			try {
				setVisibility( true );
				setFocused( true );
				nwjsService.close();
			} catch ( e ) {
				nwApp.quit();
			}
		});
	}
});
