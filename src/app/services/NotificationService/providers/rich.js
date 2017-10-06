import {
	main as mainConfig
} from "config";
import {
	window as Window
} from "nwjs/Window";
import { isWin7 } from "utils/node/platform";


const { "display-name": displayName } = mainConfig;
const notifications = Window.chrome.notifications;

const { isArray } = Array;


/**
 * Chromium Rich Notifications
 *   https://developer.chrome.com/apps/richNotifications
 *
 * Already replaced by native notifications on macOS and Linux.
 * On Windows >=8, rich notifications are also pointless due to the native action center
 * notificaions provided by snoretoast, so only make rich notifications available on Windows 7.
 *
 * @class NotificationProviderRich
 * @implements NotificationProvider
 */
export default class NotificationProviderRich {
	static isSupported() {
		return isWin7;
	}

	async setup() {
		/** @type {Map<string,Function>} */
		const callbacks = this.callbacks = new Map();
		this.index = 0;

		// remove previous event listeners
		[ "onClosed", "onClicked" ].forEach( name => {
			const event = notifications[ name ];
			event.getListeners().forEach( listener =>
				event.removeListener( listener.callback )
			);
		});

		// register a global "onClosed" event listener:
		// remove the click callback once the notification has been closed
		notifications.onClosed.addListener( id => {
			callbacks.delete( id );
		});

		// register a global "onClosed" event listener:
		// execute the click callback and hide the notification
		notifications.onClicked.addListener( id => {
			if ( callbacks.has( id ) ) {
				callbacks.get( id )();
			}
			notifications.clear( id );
		});
	}

	async notify( data ) {
		const notification = {
			title         : data.title,
			iconUrl       : data.getIconAsFileURI(),
			contextMessage: displayName,
			isClickable   : true
		};

		// support list notifications
		if ( isArray( data.message ) ) {
			notification.type = "list";
			notification.message = "";
			notification.items = data.message;
		} else {
			notification.type = "basic";
			notification.message = data.message;
		}

		// register click callback and create notification
		const id = String( ++this.index );
		this.callbacks.set( id, data.click );
		notifications.create( id, notification );
	}
}
