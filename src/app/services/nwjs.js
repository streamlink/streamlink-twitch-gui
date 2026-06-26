import { getOwner } from "@ember/application";
import { get, computed, set } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { quit } from "nwjs/App";
import { Clipboard, Shell, Window } from "nwjs/nwGui";
import {
	default as nwWindow,
	toggleVisibility,
	toggleMaximized,
	toggleMinimized,
	toggleShowInTaskbar,
	setFocused,
	setVisibility,
	setShowInTaskbar
} from "nwjs/Window";
import { ATTR_GUI_INTEGRATION_TRAY } from "data/models/settings/gui/fragment";


const { hasOwnProperty } = {};
const reVariable = /{(\w+)}/g;
const modalCloseContext = {};
const TWITCH_LOGIN_PAGE = "twitch-login.html";
const TWITCH_LOGIN_WINDOW_ID = "twitch-login";
const TWITCH_LOGIN_TOKEN_KEY = "twitch-oauth-token";


export default Service.extend( /** @class NwjsService */ {
	modal: service(),
	settings: service(),
	streaming: service(),


	/** @type {NWJS_Helpers.clip} */
	clipboard: computed(function() {
		return Clipboard.get();
	}),

	tray: computed(function() {
		return getOwner( this ).lookup( "nwjs:tray" );
	}),


	reload() {
		nwWindow.reloadIgnoringCache();
	},

	devTools() {
		nwWindow.showDevTools();
	},

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
	},

	/**
	 * Open an embedded Twitch login window and read the website session token.
	 * @returns {Promise<string>}
	 */
	openTwitchLogin() {
		// The login window loads Twitch inside a <webview> (no Node context, so it
		// won't crash) and writes the auth-token to localStorage, which is shared
		// because both pages live under the same chrome-extension:// origin.
		try {
			window.localStorage.removeItem( TWITCH_LOGIN_TOKEN_KEY );
		} catch ( e ) {
			// ignore
		}

		return new Promise( ( resolve, reject ) => {
			let settled = false;
			let saving = false;
			let pollInterval = null;
			let loginWin = null;

			const cleanup = () => {
				if ( pollInterval ) {
					clearInterval( pollInterval );
					pollInterval = null;
				}
				if ( loginWin === this._twitchLoginWindow ) {
					this._twitchLoginWindow = null;
				}
			};

			const settle = ( fn, value ) => {
				if ( settled ) {
					return;
				}
				settled = true;
				cleanup();
				fn( value );
			};

			const closeLoginWindow = () => {
				if ( !loginWin ) {
					return;
				}
				try {
					loginWin.close( true );
				} catch ( e ) {
					// ignore
				}
			};

			const readStoredToken = () => {
				let token = null;
				try {
					token = window.localStorage.getItem( TWITCH_LOGIN_TOKEN_KEY );
				} catch ( e ) {
					return false;
				}
				if ( !token ) {
					return false;
				}
				try {
					window.localStorage.removeItem( TWITCH_LOGIN_TOKEN_KEY );
				} catch ( e ) {
					// ignore
				}
				const value = String( token ).trim();
				if ( !value || saving ) {
					return false;
				}
				saving = true;
				this._saveTwitchOAuthToken( value ).then(
					() => {
						closeLoginWindow();
						settle( resolve, value );
					},
					err => {
						closeLoginWindow();
						settle( reject, err );
					}
				);
				return true;
			};

			// Keep the main application window open while the login window is shown.
			setVisibility( true );

			Window.open( TWITCH_LOGIN_PAGE, {
				id: TWITCH_LOGIN_WINDOW_ID,
				width: 1000,
				height: 760,
				show: true,
				focus: true,
				resizable: true,
				frame: true,
				show_in_taskbar: true
			}, win => {
				if ( !win ) {
					settle( reject, new Error( "Failed to open Twitch login window" ) );
					return;
				}

				loginWin = win;
				this._twitchLoginWindow = win;

				// Closing the child window must never quit the whole application.
				win.on( "close", function() {
					try {
						this.close( true );
					} catch ( e ) {
						// ignore
					}
				});

				// After the window was closed, do a final read attempt
				win.on( "closed", () => {
					if ( !readStoredToken() && !saving ) {
						settle( reject, new Error( "Twitch login window was closed" ) );
					}
				});

				pollInterval = setInterval( readStoredToken, 1000 );
				// immediate attempt (covers fast logins and tests)
				readStoredToken();
			});
		})
			.finally( () => {
				setVisibility( true );
				this.focus( true );
			});
	},

	/**
	 * @param {string} token
	 * @returns {Promise}
	 */
	async _saveTwitchOAuthToken( token ) {
		const settings = this.settings.content;
		if ( !settings ) {
			throw new Error( "Settings not loaded" );
		}

		set( settings, "streaming.twitch_oauth_token", token );
		await settings.save();
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

	focus( focus = true ) {
		setFocused( focus );
	},

	close( fromTray = false ) {
		const { integration, closetotray } = this.settings.content.gui;
		const hasTray = ( integration & ATTR_GUI_INTEGRATION_TRAY ) > 0;

		if ( !fromTray && hasTray && closetotray ) {
			setShowInTaskbar( false );
			setVisibility( false );
		} else if ( this.streaming.hasStreams ) {
			setVisibility( true );
			setFocused( true );
			this.modal.openModal( "quit", modalCloseContext );
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

	/**
	 * @param {string?} label
	 */
	setBadgeLabel( label = "" ) {
		nwWindow.setBadgeLabel( `${label}` );
	},

	/**
	 * @param {MouseEvent} event
	 * @param {nw.MenuItem[]} items
	 */
	contextMenu( event, items ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const menu = getOwner( this ).lookup( "nwjs:menu" );
		menu.items.pushObjects( items );
		menu.menu.popup( Math.round( event.clientX ), Math.round( event.clientY ) );
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
