import { getOwner } from "@ember/application";
import { default as EmberObject, get, observer } from "@ember/object";
import { default as Evented, on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { main as mainConfig, files as filesConfig } from "config";
import { Tray } from "nwjs/nwGui";
import {
	default as nwWindow,
	getVisibility,
	toggleVisibility,
	setShowInTaskbar
} from "nwjs/Window";
import { isDebug } from "nwjs/debug";
import { isWin, platform } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


const { "display-name": displayName } = mainConfig;
const { icons: { tray: { [ platform ]: trayIcons } } } = filesConfig;


export default EmberObject.extend( Evented, {
	i18n: service(),
	settings: service(),

	tray: null,
	menu: null,

	init() {
		// prevent tray icons from stacking up when refreshing the page or devtools
		nwWindow.window.addEventListener( "beforeunload", () => this._removeTray(), false );

		// locale observer doesn't work without initializing the service injection
		get( this, "i18n" );

		// context menu
		this._createMenu();

		// tray icons on Windows require an absolute path
		// TODO: rewrite this and also implement an icon resolver for Linux icon themes
		this.icons = Object.assign( {}, trayIcons );
		if ( isWin && !isDebug ) {
			for ( const [ key, icon ] of Object.entries( this.icons ) ) {
				this.icons[ key ] = resolvePath( "%NWJSAPPPATH%", icon );
			}
		}
	},


	/**
	 * Rebuild the context menu on locale change
	 */
	_localeObserver: observer( "i18n.locale", function() {
		if ( !this.tray ) { return; }
		this.menu.rebuild();
	}),


	/**
	 * Primary tray icon click listener for toggling the window and taskbar visibility
	 */
	_click: on( "click", function() {
		// toggle window visibility on click
		toggleVisibility();
		// also toggle taskbar visiblity on click (settings.gui.integration === both)
		if ( get( this, "settings.gui.isVisibleInTaskbar" ) ) {
			setShowInTaskbar( getVisibility() );
		}
	}),


	_createMenu() {
		const items = [
			{
				label: [ "contextmenu.tray.toggle" ],
				click: () => {
					if ( !this.tray ) { return; }
					this.trigger( "click" );
				}
			},
			{
				label: [ "contextmenu.tray.close" ],
				click: () => nwWindow.close()
			}
		];
		this.menu = getOwner( this ).lookup( "nwjs:menu" );
		this.menu.items.pushObjects( items );

		// re-apply menu property, so NWjs updates it
		// https://github.com/nwjs/nw.js/issues/1870#issuecomment-94958663
		this.menu.on( "update", () => {
			if ( !this.tray ) { return; }
			this.tray.menu = this.menu.menu;
		});
	},

	_createTray() {
		this._removeTray();

		const dpr = nwWindow.window.devicePixelRatio;
		this.tray = new Tray({
			icon: this.icons[ dpr > 2 ? "@3x" : dpr > 1 ? "@2x" : "@1x" ],
			tooltip: displayName
		});
		this.tray.on( "click", ( ...args ) => this.trigger( "click", ...args ) );
		this.tray.menu = this.menu.menu;
	},

	_removeTray() {
		if ( !this.tray ) { return; }
		this.tray.remove();
		this.tray = null;
	}
});
