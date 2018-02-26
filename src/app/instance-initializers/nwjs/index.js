import { get } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import { default as nwApp, quit } from "nwjs/App";
import { default as nwWindow, setVisibility, setFocused } from "nwjs/Window";
import { argv, parseCommand } from "nwjs/argv";
import platformfixes from "./platformfixes";
import { createNativeMenuBar } from "./menubar";
import onChangeIntegrations from "./integrations";
import parameterActions from "./parameters";
import windowInitializer from "./window";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "NWjs EmberJS initializer" );


export default {
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

			// observe changes to integration settings
			const settingsGui = get( settings, "gui" );
			addObserver( settingsGui, "integration", () => onChangeIntegrations( settings ) );

			nwWindow.window.initialized = true;
		});

		// react to secondary application launch attempts
		nwApp.on( "open", async command => {
			if ( !get( settings, "advanced" ) || !get( settings, "gui.externalcommands" ) ) {
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
				nwWindow.close( true );
				return;
			}

			try {
				setVisibility( true );
				setFocused( true );
				nwjsService.close();
			} catch ( e ) {
				quit();
			}
		});
	}
};
