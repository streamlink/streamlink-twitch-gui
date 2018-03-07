import { get } from "@ember/object";
import {
	ARG_TRAY,
	ARG_MIN,
	ARG_MAX,
	ARG_RESET_WINDOW,
	ARG_LAUNCH,
	ARG_GOTO
} from "nwjs/argv";
import { setMaximized, setMinimized, setVisibility } from "nwjs/Window";
import resetWindow from "nwjs/Window/reset";
import onChangeIntegrations from "./integrations";


export default async function( application, argv ) {
	// reset window
	if ( argv[ ARG_RESET_WINDOW ] ) {
		await resetWindow( true );
	}

	// maximize window
	if ( argv[ ARG_MAX ] ) {
		setMaximized( true );
	}

	if ( argv[ ARG_TRAY ] ) {
		const nwjs = application.lookup( "service:nwjs" );
		const settings = application.lookup( "service:settings" );
		const removeOnClick = !get( settings, "gui.isVisibleInTray" );
		nwjs.setShowInTray( true, removeOnClick );

	} else {
		// show tray and taskbar item depending on settings
		onChangeIntegrations( application );

		// show application window
		setVisibility( true );
	}

	// minimize window (after the visibility has changed)
	if ( argv[ ARG_MIN ] ) {
		setMinimized( true );
	}

	// go to a new route (or refresh current one)
	if ( argv[ ARG_GOTO ] ) {
		const routingService = application.lookup( "service:-routing" );
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
}
