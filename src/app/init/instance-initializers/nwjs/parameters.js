import { get } from "@ember/object";
import {
	ARG_TRAY,
	ARG_MIN,
	ARG_MAX,
	ARG_RESET_WINDOW,
	ARG_THEME,
	ARG_LAUNCH,
	ARG_GOTO
} from "nwjs/argv";
import {
	setFocused,
	setVisibility,
	setShowInTaskbar,
	toggleMaximized,
	toggleMinimized
} from "nwjs/Window";
import resetWindow from "nwjs/Window/reset";
import onChangeIntegrations from "./integrations";


export default async function( application, argv ) {
	// reset window
	if ( argv[ ARG_RESET_WINDOW ] ) {
		await resetWindow( true );
	}

	// (un)maximize window
	if ( argv[ ARG_MAX ] ) {
		toggleMaximized();
	}

	// apply custom theme
	if ( argv[ ARG_THEME ] ) {
		/** @type {ThemeService} */
		const themeService = application.lookup( "service:theme" );
		themeService.setTheme( argv[ ARG_THEME ] );
	}

	if ( argv[ ARG_TRAY ] ) {
		const nwjs = application.lookup( "service:nwjs" );
		const settings = application.lookup( "service:settings" );
		const removeOnClick = !get( settings, "gui.isVisibleInTray" );
		nwjs.setShowInTray( true, removeOnClick );
		setShowInTaskbar( false );

	} else {
		// show tray and taskbar item depending on settings
		onChangeIntegrations( application );

		// show application window
		setVisibility( true );
		// and focus window
		setFocused( true );
	}

	// (un)minimize window (after the visibility has changed)
	if ( argv[ ARG_MIN ] ) {
		toggleMinimized();
	}

	// go to a new route (or refresh current one)
	if ( argv[ ARG_GOTO ] ) {
		/** @type {RouterService} */
		const routerService = application.lookup( "service:router" );
		await routerService.transitionTo( argv[ ARG_GOTO ] );
	}

	// launch a stream by user name
	if ( argv[ ARG_LAUNCH ] ) {
		try {
			const store = application.lookup( "service:store" );
			const streamingService = application.lookup( "service:streaming" );
			const query = { user_login: argv[ ARG_LAUNCH ] };
			const twitchStream = await store.queryRecord( "twitch-stream", query );
			// don't await startStream promise
			streamingService.startStream( twitchStream );
		} catch ( e ) {}
	}
}
