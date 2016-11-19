import { main } from "config";
import NotificationProvider from "./NotificationProvider";


const { "display-name": displayName } = main;


export default class NotificationProviderRich extends NotificationProvider {
	constructor() {
		super();

		let clickCallbacks = this.clickCallbacks = [];
		let provider = this.provider = window.chrome.notifications;

		// remove previous event listeners
		[ "onClosed", "onClicked" ].forEach(function( key ) {
			let ev = provider[ key ];
			ev.getListeners().forEach(function( listener ) {
				ev.removeListener( listener.callback );
			});
		});

		// register a global "onClosed" event listener:
		// remove the click callback once the notification has been closed
		provider.onClosed.addListener(function( id ) {
			id = Number( id );
			if ( isNaN( id ) ) { return; }
			clickCallbacks.splice( id, 1 );
		});

		// register a global "onClosed" event listener:
		// execute the click callback and hide the notification
		provider.onClicked.addListener(function( id ) {
			let callback = clickCallbacks[ Number( id ) ];
			if ( callback ) {
				callback();
			}
			provider.clear( id );
		});
	}

	static test() {
		return Promise.resolve();
	}

	notify( data ) {
		return new Promise( resolve => {
			let notification = {
				title         : data.title,
				message       : data.message,
				iconUrl       : `file://${data.icon}`,
				contextMessage: displayName,
				isClickable   : true
			};

			// support list notifications
			if ( Array.isArray( data.message ) ) {
				notification.type = "list";
				notification.items = data.message;
				notification.message = "";
			} else {
				notification.type = "basic";
			}

			// register click callback and create notification
			this.clickCallbacks.push( data.click );
			this.provider.create( String( this.clickCallbacks.length - 1 ), notification );

			resolve();
		});
	}
}


NotificationProviderRich.platforms = {
	win32: null,
	darwin: null,
	linux: null
};
