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
import { platform } from "utils/node/platform";
import t from "translation-key";
import { nextTick } from "process";


const { "display-name": displayName } = mainConfig;
const { icons: { tray: { [ platform ]: trayIcons } } } = filesConfig;


export default EmberObject.extend( Evented, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {SettingsService} */
	settings: service(),

	tray: null,
	menu: null,

	init() {
		// prevent tray icons from stacking up when refreshing the page or devtools
		nwWindow.window.addEventListener( "beforeunload", () => this._removeTray(), false );

		// locale observer doesn't work without initializing the service injection
		get( this, "intl" );

		// context menu
		this._createMenu();

		// TODO: implement an icon resolver for Linux icon themes
		this.icons = Object.assign( {}, trayIcons );
	},


	/**
	 * Rebuild the context menu on locale change
	 */
	_localeObserver: observer( "intl.locale", function() {
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
				label: [ t`contextmenu.tray.toggle` ],
				click: () => {
					if ( !this.tray ) { return; }
					this.trigger( "click" );
				}
			},
			{
				label: [ t`contextmenu.tray.close` ],
				click: () => this.nwjs.close( true )
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
		nextTick( () => this.menu.trigger( "update" ) );
	},

	_removeTray() {
		if ( !this.tray ) { return; }
		this.tray.remove();
		this.tray = null;
	}
});
