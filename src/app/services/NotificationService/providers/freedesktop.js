import {
	main as mainConfig,
	notification as notificationConfig
} from "config";
import {
	window as Window
} from "nwjs/Window";
import { ATTR_NOTIFY_CLICK_NOOP } from "models/localstorage/Settings";
import { isLinux } from "utils/node/platform";
import { sessionBus } from "dbus-native";


const { "display-name": displayName } = mainConfig;
const {
	provider: {
		freedesktop: {
			expire: EXPIRE_SECS
		}
	}
} = notificationConfig;

const { setTimeout, clearTimeout } = Window;

// don't use NotificationClosed return codes
//const CODE_NOTIF_DISMISSED = 2;
//const CODE_NOTIF_CLOSED = 3;

const ACTION_OPEN_ID = "open";
const ACTION_OPEN_TEXT = "Open";
const ACTION_DISMISS_ID = "dismiss";
const ACTION_DISMISS_TEXT = "Dismiss";

const ACTIONS = [ ACTION_OPEN_ID, ACTION_OPEN_TEXT, ACTION_DISMISS_ID, ACTION_DISMISS_TEXT ];

const EXPIRE_MSECS = EXPIRE_SECS * 1000;


/**
 * @class NotificationProviderFreedesktopCallback
 * @property {Function} callback
 * @property {number} expire
 */
class NotificationProviderFreedesktopCallback {
	/**
	 * @param {Function} callback
	 * @param {number} expire
	 */
	constructor( callback, expire ) {
		this.callback = callback;
		this.expire = expire;
	}
}


/**
 * Freedesktop notifications
 *   https://developer.gnome.org/notification-spec/
 *
 * Use the "dbus-native" module for all DBus communication.
 * This only requires native node modules in special cases, which have been disabled by webpack.
 *
 * @class NotificationProviderFreedesktop
 * @implements NotificationProvider
 */
export default class NotificationProviderFreedesktop {
	static isSupported() {
		return isLinux;
	}

	/**
	 * Calls a method on the given dbus interface and returns a Promise
	 * @param {Object} iface
	 * @param {string} method
	 * @param {...(*)} args
	 * @returns {Promise}
	 */
	static async callMethod( iface, method, ...args ) {
		return await new Promise( ( resolve, reject ) => {
			iface[ method ]( ...args, ( err, result ) => {
				if ( err ) {
					reject( err );
				} else {
					resolve( result );
				}
			});
		});
	}

	async setup() {
		// get the session bus
		const bus = sessionBus();
		if ( !bus ) {
			throw new Error( "Could not connect to the DBus session bus" );
		}

		const { callMethod } = NotificationProviderFreedesktop;

		// get the session bus freedesktop notification interface
		const iNotification = await callMethod(
			bus.getService( "org.freedesktop.Notifications" ),
			"getInterface",
			"/org/freedesktop/Notifications",
			"org.freedesktop.Notifications"
		);
		this.iNotification = iNotification;

		// check notification server
		await callMethod( iNotification, "GetServerInformation" );

		// get server capabilities
		const capabilities = await callMethod( iNotification, "GetCapabilities" );
		this.supportsActions = capabilities.includes( "actions" );

		/** @type {Map<number,NotificationProviderFreedesktopCallback>} */
		this.callbacks = new Map();

		iNotification.on( "NotificationClosed", ( id/*, code*/ ) => {
			if ( !this.callbacks.has( id ) ) { return; }
			this.unregisterCallback( id );
		});

		iNotification.on( "ActionInvoked", ( id, action ) => {
			if ( !this.callbacks.has( id ) ) { return; }
			if ( this.supportsActions && action === ACTION_OPEN_ID ) {
				this.callbacks.get( id ).callback();
			}
			this.unregisterCallback( id );
		});
	}

	/**
	 * @param {NotificationData} data
	 * @returns {Promise}
	 */
	async notify( data ) {
		const actions = this.getActions( data );

		const id = await NotificationProviderFreedesktop.callMethod(
			this.iNotification,
			"Notify",
			displayName,
			0,
			data.icon,
			data.title,
			data.getMessageAsString(),
			actions,
			{},
			EXPIRE_SECS
		);

		if ( actions.length ) {
			this.registerCallback( id, data.click );
		}
	}

	/**
	 * @param {NotificationData} data
	 * @returns {string[]}
	 */
	getActions( data ) {
		const actions = this.supportsActions
			&& data.click
			&& data.settings !== ATTR_NOTIFY_CLICK_NOOP;

		return actions
			? ACTIONS
			: [];
	}

	/**
	 * @param {number} id
	 * @param {Function} callback
	 */
	registerCallback( id, callback ) {
		const expire = setTimeout( () => this.callbacks.delete( id ), EXPIRE_MSECS );
		this.callbacks.set( id, new NotificationProviderFreedesktopCallback( callback, expire ) );
	}

	/**
	 * @param {number} id
	 */
	unregisterCallback( id ) {
		clearTimeout( this.callbacks.get( id ).expire );
		this.callbacks.delete( id );
	}
}
