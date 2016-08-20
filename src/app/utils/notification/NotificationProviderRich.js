import NotificationProvider from "./NotificationProvider";
import { main } from "config";
import UTIL from "util";


const { "display-name": displayName } = main;


function NotificationProviderRich() {
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

UTIL.inherits( NotificationProviderRich, NotificationProvider );

NotificationProviderRich.platforms = {
	win32: null,
	darwin: null,
	linux: null
};

/**
 * @returns {Promise}
 */
NotificationProviderRich.test = function() {
	return Promise.resolve();
};

NotificationProviderRich.prototype.notify = function( data ) {
	let notification = {
		title         : data.title,
		message       : data.message,
		iconUrl       : data.icon,
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
};


export default NotificationProviderRich;
