import { get } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import $ from "jquery";
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
		const rootElement = get( application, "rootElement" );
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

		$( rootElement )
			.on( "mouseup", e => {
				if ( e.buttons & 0b01000 ) {
					return history( e, -1 );
				}
				if ( e.buttons & 0b10000 ) {
					return history( e, +1 );
				}
			})
			.on( "keyup", e => HotkeyService.trigger( e ) )
			.on( "dragstart dragover dragend dragenter dragleave dragexit drag drop", e => {
				e.preventDefault();
				e.stopImmediatePropagation();
			});
	}
};
