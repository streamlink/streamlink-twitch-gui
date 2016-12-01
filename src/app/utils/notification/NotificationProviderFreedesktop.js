import { main } from "config";
import NotificationProvider from "./NotificationProvider";
import which from "utils/node/fs/which";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { spawn } from "child_process";
import { EventEmitter } from "events";


const { "display-name": displayName } = main;

// https://developer.gnome.org/notification-spec/
const DBUS_NAME = "org.freedesktop.Notifications";
const DBUS_PATH = "/org/freedesktop/Notifications";

//const CODE_NOTIF_DISMISSED = 2;
//const CODE_NOTIF_CLOSED = 3;

const EVENT_CLOSED = "closed";
const EVENT_ACTION = "action";

const TIME_MONITOR_INIT = 3000;

const ACTION_OPEN_ID   = "open";
const ACTION_OPEN_TEXT = "Open";
const ACTION_DISMISS_ID   = "dismiss";
const ACTION_DISMISS_TEXT = "Dismiss";

const EXPIRE_SECS = 3600 * 12;
const EXPIRE_MSECS = EXPIRE_SECS * 1000;


const commonParams = [
	"--session",
	"--dest",
	DBUS_NAME,
	"--object-path",
	DBUS_PATH,
];

const strActions = [ ACTION_OPEN_ID, ACTION_OPEN_TEXT, ACTION_DISMISS_ID, ACTION_DISMISS_TEXT ]
	.map( item => `'${item}'` )
	.join( "," );


const reDbusName = DBUS_NAME.replace( ".", "\\." );
const reCapabilities = /^\(\s*(\[.*])\s*,?\s*\)$/;
const reCapabilityString = /'/g;
const reMonitorSuccess = [
	new RegExp( `^Monitoring signals on object ${DBUS_PATH} owned by ${reDbusName}$` ),
	new RegExp( `^The name ${reDbusName} is owned by .+$` )
];
const reMonitorMessage = new RegExp([
	`^${DBUS_PATH}: `,
	`${reDbusName}\\.(ActionInvoked|NotificationClosed) `,
	"\\(uint32 (\\d+), (?:uint32 (\\d+)|'(.+)')\\)$"
].join( "" ) );
const reCall = /^\(uint32 (\d+),?\)$/;


function callMethod( exec, method, params, onExit, onStdOut ) {
	let child;

	function kill() {
		if ( child ) {
			child.kill();
		}
		child = null;
		process.removeListener( "exit", kill );
	}

	return new Promise( ( resolve, reject ) => {
		child = spawn( exec, [
			"call",
			...commonParams,
			"--method",
			method,
			...params
		]);
		child.once( "error", reject );
		child.on( "exit", code => onExit( code, resolve, reject ) );

		process.on( "exit", kill );

		if ( onStdOut ) {
			child.stdout.on( "data", new StreamOutputBuffer(
				line => onStdOut( line, resolve, reject )
			) );
		}
	})
		.finally( kill );
}


class NotificationFreedesktopCallback {
	/**
	 * @param {Function} click
	 * @param {Number} expire
	 */
	constructor( click, expire ) {
		this.click = click;
		this.expire = expire;
	}
}


export default class NotificationProviderFreedesktop extends NotificationProvider {
	/**
	 * @param {String} exec
	 * @param {Boolean} supportsActions
	 */
	constructor({ exec, supportsActions }) {
		super();
		this.exec = exec;
		this.supportsActions = supportsActions;
		this.events = new EventEmitter();
		/** @type {ChildProcess} */
		this.monitorSpawn = null;
		/** @type {Object<Number,NotificationFreedesktopCallback>} */
		this.callbacks = {};
	}

	static test() {
		return which( "gdbus" )
			.then( exec => NotificationProviderFreedesktop.getServerInformation( exec )
				.then( () => NotificationProviderFreedesktop.getCapabilities( exec ) )
				.then( supportsActions => ({ exec, supportsActions }) )
			);
	}

	static getServerInformation( exec ) {
		return callMethod(
			exec,
			"org.freedesktop.Notifications.GetServerInformation",
			[],
			( code, resolve, reject ) => {
				if ( code === 0 ) {
					resolve( exec );
				} else {
					reject( new Error( "Could not validate notification server" ) );
				}
			}
		);
	}

	static getCapabilities( exec ) {
		return callMethod(
			exec,
			"org.freedesktop.Notifications.GetCapabilities",
			[],
			( code, resolve, reject ) => {
				if ( code !== 0 ) {
					reject( new Error( "Could not validate notification server" ) );
				}
			},
			( line, resolve, reject ) => {
				if ( !line ) { return; }

				let match = reCapabilities.exec( line.trim() );
				if ( !match ) {
					return reject( new Error( "Invalid capabilities response" ) );
				}

				let capabilities = JSON.parse( match[ 1 ].replace( reCapabilityString, "\"" ) );
				if ( !capabilities || !Array.isArray( capabilities ) ) {
					return reject( new Error( "Capabilities parsing error" ) );
				}

				resolve( capabilities.indexOf( "actions" ) !== -1 );
			}
		);
	}

	monitor() {
		if ( this.monitorSpawn !== null ) {
			return Promise.resolve();
		}

		return new Promise( ( resolve, reject ) => {
			let params = [ "monitor", ...commonParams ];
			let child = spawn( this.exec, params );

			let success = 0;
			let length = reMonitorSuccess.length;
			let timeout = setTimeout( reject, TIME_MONITOR_INIT );

			let onStdOut = new StreamOutputBuffer( data => {
				// wait for all success messages to appear
				if ( success < length ) {
					if ( !reMonitorSuccess[ success ].test( data ) ) {
						reject();
					} else if ( ++success === length ) {
						clearTimeout( timeout );
						resolve( child );
					}
					return;
				}

				// parse messages
				let match = reMonitorMessage.exec( data );
				if ( !match ) { return; }

				let [ , signal, id, code, action ] = match;
				id = Number( id );
				if ( isNaN( id ) ) { return; }

				switch ( signal ) {
					case "NotificationClosed":
						return this.events.emit( EVENT_CLOSED, id, Number( code ) );
					case "ActionInvoked":
						return this.events.emit( EVENT_ACTION, id, action );
				}
			});

			child.once( "error", reject );
			child.once( "exit", () => {
				onExit();
				reject();
			});
			child.stdout.on( "data", onStdOut );

			let onExit = () => {
				this.events.removeAllListeners();
				window.removeEventListener( "beforeunload", onExit, false );

				if ( this.monitorSpawn ) {
					this.monitorSpawn.kill();
				}
				this.monitorSpawn = null;
				Object.keys( this.callbacks ).forEach( id => this.unregisterCallback( id ) );
			};

			// kill the monitor child process on page refreshes (dev)
			window.addEventListener( "beforeunload", onExit, false );

			// kill the monitor child process when the application exits
			process.on( "exit", () => child.kill() );
		})
			.then( child => {
				this.monitorSpawn = child;

				this.events.addListener( EVENT_CLOSED, ( id/*, code*/ ) => {
					// look only for registered callbacks
					if ( !this.callbacks.hasOwnProperty( id ) ) { return; }
					// remove callback and its expiration timeout
					this.unregisterCallback( id );
				});

				this.events.addListener( EVENT_ACTION, ( id, action ) => {
					// look only for registered callbacks
					if ( !this.callbacks.hasOwnProperty( id ) ) { return; }
					// execute click callback if user has dismissed the notification
					if ( this.supportsActions && action === ACTION_OPEN_ID ) {
						this.callbacks[ id ].click();
					}
					// remove callback and its expiration timeout
					this.unregisterCallback( id );
				});
			});
	}

	send( data ) {
		let showActions = this.supportsActions && data.click && data.settings > 0;

		return callMethod(
			this.exec,
			"org.freedesktop.Notifications.Notify",
			[
				displayName,
				"0",
				data.icon,
				data.title,
				NotificationProvider.getMessageAsString( data.message ),
				`[${showActions ? strActions : ""}]`,
				"{}",
				EXPIRE_SECS
			],
			( code, resolve, reject ) => {
				if ( code !== 0 ) {
					reject( new Error( "Could not create notification" ) );
				}
			},
			// get notification ID from stdout
			( line, resolve, reject ) => {
				if ( !line ) { return; }

				let match = reCall.exec( line );
				if ( !match ) {
					return reject( new Error( "Unexpected output" ) );
				}

				let id = Number( match[ 1 ] );
				if ( isNaN( id ) ) {
					return reject( new Error( "Invalid notification ID" ) );
				}

				resolve( id );
			}
		)
			.then( id => showActions
				? this.registerCallback( data, id )
				: undefined
			);
	}

	registerCallback( data, id ) {
		this.callbacks[ id ] = new NotificationFreedesktopCallback(
			data.click,
			setTimeout( () => {
				delete this.callbacks[ id ];
			}, EXPIRE_MSECS )
		);
	}

	unregisterCallback( id ) {
		clearTimeout( this.callbacks[ id ].expire );
		delete this.callbacks[ id ];
	}

	notify( data ) {
		// the notification monitor needs to be launched first
		return this.monitor()
			// create the notification
			.then( () => this.send( data ) );
	}
}


NotificationProviderFreedesktop.platforms = {
	linux: "growl"
};
