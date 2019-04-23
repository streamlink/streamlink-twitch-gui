import { getOwner } from "@ember/application";
import { computed } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { quit } from "nwjs/App";
import { Clipboard, Shell } from "nwjs/nwGui";
import {
	default as nwWindow,
	toggleVisibility,
	toggleMaximized,
	toggleMinimized,
	toggleShowInTaskbar,
	setFocused
} from "nwjs/Window";
import { ATTR_GUI_INTEGRATION_TRAY } from "data/models/settings/gui/fragment";


const { hasOwnProperty } = {};
const reVariable = /{(\w+)}/g;


export default class NwjsService extends Service {
	/** @type {ModalService} */
	@service modal;
	/** @type {SettingsService} */
	@service settings;
	/** @type {StreamingService} */
	@service streaming;


	/** @type {NWJS_Helpers.clip} */
	@computed()
	get clipboard() {
		return Clipboard.get();
	}

	@computed()
	get tray() {
		return getOwner( this ).lookup( "nwjs:tray" );
	}


	reload() {
		nwWindow.reloadIgnoringCache();
	}

	devTools() {
		nwWindow.showDevTools();
	}

	/**
	 * @param {string} url
	 * @param {Object<string,string>?} vars
	 * @returns {string}
	 */
	openBrowser( url, vars ) {
		if ( !url ) {
			throw new Error( "Missing URL" );
		}

		const hasVars = vars && typeof vars === "object";
		url = url.replace( reVariable, ( _, name ) => {
			if ( !hasVars || !hasOwnProperty.call( vars, name ) ) {
				throw new Error( `Missing value for key '${name}'` );
			}

			return vars[ name ];
		});

		Shell.openExternal( url );
	}

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
	}

	maximize() {
		toggleMaximized();
	}

	focus( focus = true ) {
		setFocused( focus );
	},

	close() {
		/** @type {Stream[]} */
		const streams = this.streaming.model.toArray();
		if ( streams.length && streams.some( stream => !stream.hasEnded ) ) {
			this.modal.openModal( "quit", this );
		} else {
			this.quit();
		}
	}

	quit() {
		quit();
	}

	setShowInTray( visible, removeOnClick ) {
		const tray = this.tray;
		if ( visible ) {
			tray._createTray();
			if ( removeOnClick ) {
				tray.one( "click", () => tray._removeTray() );
			}
		} else {
			tray._removeTray();
		}
	}

	contextMenu( event, items ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const menu = getOwner( this ).lookup( "nwjs:menu" );
		menu.items.pushObjects( items );
		menu.menu.popup( event.x, event.y );
	}

	addTrayMenuItem( item, position ) {
		const tray = this.tray;
		if ( position === undefined ) {
			tray.menu.items.unshiftObject( item );
		} else {
			tray.menu.items.insertAt( position, item );
		}
	}

	removeTrayMenuItem( item ) {
		const tray = this.tray;
		tray.menu.items.removeObject( item );
	}
}
