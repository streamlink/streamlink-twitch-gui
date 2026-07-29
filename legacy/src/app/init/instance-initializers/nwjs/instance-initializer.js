import { get } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import { later, scheduleOnce } from "@ember/runloop";
import { default as nwApp, quit } from "nwjs/App";
import { default as nwWindow, setFocused, setVisibility } from "nwjs/Window";
import { argv, parseCommand } from "nwjs/argv";
import onChangeIntegrations from "./integrations";
import parameterActions from "./parameters";
import windowInitializer from "./window";
import Logger from "utils/Logger";
import { isDarwin } from "utils/node/platform";


const { logDebug, logError } = new Logger( "NWjs EmberJS initializer" );


export default {
	name: "nwjs",
	after: "intl",

	initialize( application ) {
		/** @type {NwjsService} */
		const nwjs = application.lookup( "service:nwjs" );
		/** @type {RouterService} */
		const router = application.lookup( "service:router" );
		/** @type {SettingsService} */
		const settings = application.lookup( "service:settings" );

		// add event listener before routing starts
		const routingPromise = new Promise( resolve => {
			const listener = transition => {
				if ( transition.to ) {
					router.off( "routeDidChange", listener );
					resolve( transition.to.name );
				}
			};
			router.on( "routeDidChange", listener );
		});

		// initialize all the NWjs stuff
		// and wait until Ember has started rendering and routing
		settings.one( "initialized", async () => {
			// load app theme
			const themeService = application.lookup( "service:theme" );
			themeService.initialize();

			// build macOS native menubar
			if ( isDarwin ) {
				application.lookup( "nwjs:menubar" );
			}

			// restore window position first (while being hidden)
			await windowInitializer( application );

			// Wait until Ember has rendered the app for the first time (window is still hidden).
			// Wrap scheduled "afterRender" run-loop queue callback in a new run-loop to ensure
			// that the DOM is fully rendered and no white screen will appear for a few frames.
			// We can't use requestAnimationFrame here due to issue #911.
			await new Promise( resolve => later( () => scheduleOnce( "afterRender", resolve ) ) );

			// wait until the target route is loaded
			const routeName = await routingPromise;
			// then load the user's homepage, but don't await the completion of the transition
			if ( routeName === "index" ) {
				router.homepage( true );
			}

			// add "initialized" class name to the document element just before showing the window
			const document = application.lookup( "service:-document" );
			document.documentElement.classList.add( "initialized" );

			try {
				// window will be shown depending on the used parameters
				await parameterActions( application, argv );
			} catch ( error ) {
				await logError( error );
			}

			// observe changes to integration settings
			const settingsGui = get( settings, "gui" );
			addObserver( settingsGui, "integration", () => onChangeIntegrations( application ) );

			nwWindow.window.initialized = true;
		});

		// react to secondary application launch attempts
		nwApp.on( "open", async command => {
			if ( !get( settings, "advanced" ) || !get( settings, "gui.externalcommands" ) ) {
				setVisibility( true );
				setFocused( true );
				return;
			}
			const argv = parseCommand( command );

			await logDebug( "Received parameters from new application instance", () => argv );

			try {
				await parameterActions( application, argv );
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
				nwjs.close();
			} catch ( e ) {
				quit();
			}
		});
	}
};
