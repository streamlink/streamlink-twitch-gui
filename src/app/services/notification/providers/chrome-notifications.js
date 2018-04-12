import { window as Window } from "nwjs/Window";


const notifications = Window.chrome.notifications;

const { isArray } = Array;


/**
 * Chrome extension Notifications API
 *
 * Windows
 *   native notifications unsupported
 *   uses Chromium rich notifications instead (rendered by Chromium itself)
 *   https://crbug.com/516147
 *
 * macOS
 *   native notifications since Chromium 54 (NWjs 0.18) behind a feature flag
 *   native notifications since Chromium 59 (NWjs 0.23)
 *   https://crbug.com/326539
 *
 * Linux
 *   native notifications since Chromium 61 (NWjs 0.25) behind a feature flag
 *   https://crbug.com/676220
 *
 * @class NotificationProviderChromeNotifications
 */
export default class NotificationProviderChromeNotifications {
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
				const callback = callbacks.get( id );
				if ( callback instanceof Function ) {
					callback();
				}
			}
			notifications.clear( id );
		});
	}

	async notify( data ) {
		const notification = {
			title: data.title,
			iconUrl: data.getIconAsFileURI(),
			isClickable: true
		};

		// notification type (lists are only supported by rich notifications)
		if ( isArray( data.message ) ) {
			if ( this.constructor.supportsListNotifications() ) {
				notification.type = "list";
				notification.message = "";
				notification.items = data.message;
			} else {
				notification.type = "basic";
				notification.message = data.getMessageAsString();
			}
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
