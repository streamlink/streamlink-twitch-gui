import { getOwner } from "@ember/application";
import { get, computed } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { quit } from "nwjs/App";
import {
	default as nwWindow,
	toggleVisibility,
	toggleMaximized,
	toggleMinimized,
	toggleShowInTaskbar
} from "nwjs/Window";
import { openBrowser } from "nwjs/Shell";
import { ATTR_GUI_INTEGRATION_TRAY } from "data/models/settings/gui/fragment";


export default Service.extend( /** @class NwjsService */ {
	modal: service(),
	settings: service(),
	streaming: service(),

	tray: computed(function() {
		return getOwner( this ).lookup( "nwjs:tray" );
	}),


	reload() {
		nwWindow.reloadIgnoringCache();
	},

	devTools() {
		nwWindow.showDevTools();
	},

	openBrowser( ...args ) {
		return openBrowser( ...args );
	},

	minimize() {
		const { integration, minimizetotray } = this.settings.content.gui;

		// hide the window when in tray-only-mode or in both-mode with min2tray setting enabled
		if (
			   integration === ATTR_GUI_INTEGRATION_TRAY
			|| ( integration & ATTR_GUI_INTEGRATION_TRAY ) > 0
			&& minimizetotray
		) {
			toggleShowInTaskbar();
			toggleVisibility();
		} else {
			toggleMinimized();
		}
	},

	maximize() {
		toggleMaximized();
	},

	close() {
		const streams = get( this, "streaming.model" ).toArray();
		if ( streams.length && streams.some( stream => !get( stream, "hasEnded" ) ) ) {
			get( this, "modal" ).openModal( "quit", this );
		} else {
			this.quit();
		}
	},

	quit() {
		quit();
	},

	setShowInTray( visible, removeOnClick ) {
		const tray = get( this, "tray" );
		if ( visible ) {
			tray._createTray();
			if ( removeOnClick ) {
				tray.one( "click", () => tray._removeTray() );
			}
		} else {
			tray._removeTray();
		}
	},

	contextMenu( event, items ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const menu = getOwner( this ).lookup( "nwjs:menu" );
		menu.items.pushObjects( items );
		menu.menu.popup( event.originalEvent.x, event.originalEvent.y );
	},

	addTrayMenuItem( item, position ) {
		const tray = get( this, "tray" );
		if ( position === undefined ) {
			tray.menu.items.unshiftObject( item );
		} else {
			tray.menu.items.insertAt( position, item );
		}
	},

	removeTrayMenuItem( item ) {
		const tray = get( this, "tray" );
		tray.menu.items.removeObject( item );
	}
});
