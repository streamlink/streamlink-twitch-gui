import { default as EmberObject, get, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { main as mainConfig } from "config";
import { Menu, MenuItem } from "nwjs/nwGui";
import nwWindow from "nwjs/Window";


const { "display-name": displayName } = mainConfig;


export default EmberObject.extend({
	i18n: service(),
	routing: service( "-routing" ),

	init() {
		this._buildMenubar();
	},

	_localeObserver: observer( "i18n.locale", function() {
		this._buildMenubar();
	}),

	_buildMenubar() {
		const i18n = get( this, "i18n" );
		const routing = get( this, "routing" );

		const menubar = new Menu({ type: "menubar" });
		menubar.createMacBuiltin( displayName, {
			hideEdit  : false,
			hideWindow: false
		});

		// add a preferences menu item to the main menubar submenu
		const mainMenu = menubar.items[ 0 ].submenu;
		mainMenu.insert( new MenuItem({ type: "separator" }), 1 );
		const preferences = new MenuItem({
			type: "normal",
			label: i18n.t( "contextmenu.macOS.preferences" ).toString(),
			key: ",",
			modifiers: "cmd"
		});
		preferences.click = () => routing.transitionTo( "settings" );
		mainMenu.insert( preferences, 2 );

		// add a refresh menu item to the view menubar submenu
		const viewMenu = menubar.items[ 2 ].submenu;
		const refresh = new MenuItem({
			type: "normal",
			label: i18n.t( "contextmenu.macOS.refresh" ).toString(),
			key: "r",
			modifiers: "cmd"
		});
		refresh.click = () => routing.refresh();
		viewMenu.insert( refresh, 0 );

		// set native window menu
		nwWindow.menu = menubar;
	}
});
