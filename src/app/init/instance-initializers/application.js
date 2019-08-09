import { get } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import { themes as themesConfig } from "config";
import { enable as enableSmoothScroll, disable as disableSmoothScroll } from "smoothscroll";


const { themes: themesList } = themesConfig;
const reTheme = /^theme-/;


export default {
	name: "application",
	before: "nwjs",

	initialize( application ) {
		const document = application.lookup( "service:-document" );
		const RouterService = application.lookup( "service:router" );
		const SettingsService = application.lookup( "service:settings" );
		const HotkeyService = application.lookup( "service:hotkey" );
		const rootElement = document.querySelector( application.rootElement );
		const classList = document.documentElement.classList;

		addObserver( SettingsService, "gui.theme", SettingsService, function() {
			let theme = get( this, "gui.theme" );

			if ( themesList.indexOf( theme ) === -1 ) {
				theme = "default";
			}

			classList.forEach( name => {
				if ( !reTheme.test( name ) ) { return; }
				classList.remove( name );
			});

			classList.add( `theme-${theme}` );
		});

		addObserver( SettingsService, "gui.smoothscroll", SettingsService, function() {
			if ( get( this, "gui.smoothscroll" ) ) {
				enableSmoothScroll();
			} else {
				disableSmoothScroll();
			}
		});

		function history( e, go ) {
			e.preventDefault();
			e.stopImmediatePropagation();
			RouterService.history( go );
		}
		rootElement.addEventListener( "mouseup", e => {
			if ( e.buttons & 0b01000 ) {
				return history( e, -1 );
			}
			if ( e.buttons & 0b10000 ) {
				return history( e, +1 );
			}
		});

		const reHotkeyIgnoreTags = /^(INPUT|TEXTAREA)$/;
		rootElement.addEventListener( "keyup", e => {
			if ( !reHotkeyIgnoreTags.test( e.target.nodeName ) ) {
				HotkeyService.trigger( e );
			}
		});

		const events = "dragstart dragover dragend dragenter dragleave dragexit drag drop";
		const disableDrag = e => {
			e.preventDefault();
			e.stopImmediatePropagation();
		};
		for ( const e of events.split( " " ) ) {
			rootElement.addEventListener( e, disableDrag );
		}
	}
};
