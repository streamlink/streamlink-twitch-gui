import {
	module,
	test
} from "qunit";
import notificationProviderFreedesktopInjector
	from "inject-loader!services/NotificationService/providers/freedesktop";
import NotificationData from "services/NotificationService/data";
import { EventEmitter } from "events";


const config = {
	main: {
		"display-name": "application name"
	},
	notification: {
		provider: {
			freedesktop: {
				expire: 2
			}
		}
	}
};
const ATTR_NOTIFY_CLICK_NOOP = 0;
const ATTR_NOTIFY_CLICK_FOLLOWED = 1;


module( "services/NotificationService/providers/freedesktop" );


test( "isSupported", assert => {

	const common = {
		config,
		"nwjs/Window": {
			window: {}
		},
		"models/localstorage/Settings": {},
		"dbus-native": {}
	};

	let NotificationProviderFreedesktop;

	NotificationProviderFreedesktop = notificationProviderFreedesktopInjector( Object.assign( {}, {
		"utils/node/platform": {
			isLinux: false
		}
	}, common ) )[ "default" ];

	assert.notOk( NotificationProviderFreedesktop.isSupported(), "Is not supported" );

	NotificationProviderFreedesktop = notificationProviderFreedesktopInjector( Object.assign( {}, {
		"utils/node/platform": {
			isLinux: true
		}
	}, common ) )[ "default" ];

	assert.ok( NotificationProviderFreedesktop.isSupported(), "Is supported" );

});


test( "callMethod", async assert => {

	assert.expect( 5 );

	const { default: NotificationProviderFreedesktop } = notificationProviderFreedesktopInjector({
		config,
		"nwjs/Window": { window: {} },
		"models/localstorage/Settings": {},
		"utils/node/platform": {},
		"dbus-native": {}
	});

	const result = await NotificationProviderFreedesktop.callMethod(
		{
			foo( ...args ) {
				const callback = args.pop();
				assert.propEqual( args, [ 123, 456 ], "Calls method with correct args" );
				assert.ok( callback instanceof Function, "Last param is a callback" );
				callback( null, 789 );
			}
		},
		"foo",
		123,
		456
	);
	assert.strictEqual( result, 789, "Resolves with correct return value" );

	try {
		await NotificationProviderFreedesktop.callMethod(
			{
				foo( ...args ) {
					args.pop()( new Error( "fail" ), 789 );
				}
			},
			"foo",
			123,
			456
		);
	} catch ( e ) {
		assert.strictEqual( e.message, "fail", "Rejects on error" );
	}

	try {
		await NotificationProviderFreedesktop.callMethod( {}, "foo" );
	} catch ( e ) {
		assert.ok( e instanceof TypeError, "Invalid methods reject with a TypeError" );
	}

});


test( "setup", async assert => {

	assert.expect( 40 );

	let failSessionBus = true;
	let failGetService = true;
	let failGetInterface = true;
	let failGetServerInformation = true;
	let failGetCapabilities = true;

	const capabilities = [];

	const iface = new EventEmitter();
	iface.GetServerInformation = callback => {
		if ( failGetServerInformation ) {
			callback( new Error( "fail server information" ) );
		} else {
			callback( null, null );
		}
	};
	iface.GetCapabilities = callback => {
		if ( failGetCapabilities ) {
			callback( new Error( "fail capabilities" ) );
		} else {
			callback( null, capabilities );
		}
	};

	const service = {
		getInterface( path, ifaceName, callback ) {
			assert.strictEqual(
				path,
				"/org/freedesktop/Notifications",
				"Requests the correct freedesktop notification path"
			);
			assert.strictEqual(
				ifaceName,
				"org.freedesktop.Notifications",
				"Requests the correct freedesktop notification interface"
			);
			if ( failGetInterface ) {
				callback( new Error( "fail interface" ) );
			} else {
				callback( null, iface );
			}
		}
	};

	const sessionBus = {
		getService( name ) {
			assert.strictEqual(
				name,
				"org.freedesktop.Notifications",
				"Requests the correct service name"
			);
			if ( failGetService ) {
				throw new Error( "fail service" );
			} else {
				return service;
			}
		}
	};

	const { default: NotificationProviderFreedesktop } = notificationProviderFreedesktopInjector({
		config,
		"nwjs/Window": { window: {} },
		"models/localstorage/Settings": {},
		"utils/node/platform": {},
		"dbus-native": {
			sessionBus() {
				return failSessionBus
					? false
					: sessionBus;
			}
		}
	});

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual(
			e.message,
			"Could not connect to the DBus session bus",
			"sessionBus fail"
		);
	}

	failSessionBus = false;

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail service", "getService fail" );
	}

	failGetService = false;

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail interface", "getInterface fail" );
	}

	failGetInterface = false;

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail server information", "GetServerInformation fail" );
	}

	failGetServerInformation = false;

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
	} catch ( e ) {
		assert.strictEqual( e.message, "fail capabilities", "GetCapabilities fail" );
	}

	failGetCapabilities = false;

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
		assert.strictEqual( inst.iNotification, iface, "Has the dbus interface property" );
		assert.strictEqual( inst.supportsActions, false, "Doesn't support actions" );
		assert.ok( inst.callbacks instanceof Map, "Has a callbacks map registered" );
		assert.propEqual(
			iface.eventNames(),
			[ "NotificationClosed", "ActionInvoked" ],
			"Interface has listeners set up"
		);
	} catch ( e ) {
		throw e;
	}

	iface.removeAllListeners();
	capabilities.push( "actions" );

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.setup();
		assert.strictEqual( inst.supportsActions, true, "Supports actions" );

		inst.unregisterCallback = id => {
			assert.strictEqual( id, 1, "Calls unregisterCallback" );
			assert.step( "unregister" );
		};
		/** @type {NotificationProviderFreedesktopCallback} */
		const callback = {
			callback() {
				assert.step( "callback" );
			}
		};

		iface.emit( "NotificationClosed", 1 );
		iface.emit( "ActionInvoked", 1 );
		assert.checkSteps( [], "Doesn't call unregisterCallback on unknown notifications" );

		inst.callbacks.set( 1, callback );
		iface.emit( "NotificationClosed", 1 );
		assert.checkSteps( [ "unregister" ], "Unregisters known notification callback" );

		iface.emit( "ActionInvoked", 1 );
		assert.checkSteps( [ "unregister" ], "Unregisters known notification callback" );
		iface.emit( "ActionInvoked", 1, "open" );
		assert.checkSteps( [ "callback", "unregister" ], "Executes callback" );

		inst.supportsActions = false;
		iface.emit( "ActionInvoked", 1, "open" );
		assert.checkSteps( [ "unregister" ], "Doesn't execute callback" );
	} catch ( e ) {
		throw e;
	}

});


test( "getActions", assert => {

	const { default: NotificationProviderFreedesktop } = notificationProviderFreedesktopInjector({
		config,
		"nwjs/Window": { window: {} },
		"models/localstorage/Settings": {
			ATTR_NOTIFY_CLICK_NOOP
		},
		"utils/node/platform": {},
		"dbus-native": {}
	});

	const dataWithoutClick = new NotificationData({});
	const dataWithoutAction = new NotificationData({
		click() {},
		settings: ATTR_NOTIFY_CLICK_NOOP
	});
	const dataWithAction = new NotificationData({
		click() {},
		settings: ATTR_NOTIFY_CLICK_FOLLOWED
	});

	const inst = new NotificationProviderFreedesktop();

	inst.supportsActions = false;
	assert.propEqual( inst.getActions( dataWithoutClick ), [], "No actions, if unsupported" );
	assert.propEqual( inst.getActions( dataWithoutAction ), [], "No actions, if unsupported" );
	assert.propEqual( inst.getActions( dataWithAction ), [], "No actions, if unsupported" );

	inst.supportsActions = true;
	assert.propEqual( inst.getActions( dataWithoutClick ), [], "No actions, if no callback" );
	assert.propEqual( inst.getActions( dataWithoutAction ), [], "No actions, if no user actions" );
	assert.propEqual(
		inst.getActions( dataWithAction ),
		[ "open", "Open", "dismiss", "Dismiss" ],
		"Returns open and dismiss actions"
	);

});


test( "notify", async assert => {

	assert.expect( 20 );

	let failNotify = true;
	let data;

	let expectedMessage;
	let expectedActions = [];
	const click = () => {};

	const { default: NotificationProviderFreedesktop } = notificationProviderFreedesktopInjector({
		config,
		"nwjs/Window": { window: {} },
		"models/localstorage/Settings": {},
		"utils/node/platform": {},
		"dbus-native": {}
	});

	NotificationProviderFreedesktop.prototype.iNotification = {
		Notify( name, id, icon, title, message, actions, hints, expire, callback ) {
			if ( failNotify ) {
				return callback( new Error( "fail notify" ) );
			}

			assert.strictEqual( name, "application name", "Has correct app name" );
			assert.strictEqual( id, 0, "Don't replace any notifications" );
			assert.strictEqual( icon, "icon-path", "Has the correct icon path" );
			assert.strictEqual( title, "title", "Has the correct title" );
			assert.strictEqual( message, expectedMessage, "Has the correct message" );
			assert.strictEqual( actions, expectedActions, "Uses the returned actions array" );
			assert.propEqual( hints, {}, "Doesn't use any notification hints" );
			assert.strictEqual( expire, 2, "Sets the correct expiration time in seconds" );

			callback( null, 1 );
		}
	};

	NotificationProviderFreedesktop.prototype.getActions = obj => {
		assert.strictEqual( obj, data, "Calls getActions" );
		return expectedActions;
	};

	NotificationProviderFreedesktop.prototype.registerCallback = ( id, callback ) => {
		assert.strictEqual( id, 1, "Registers notification id" );
		assert.strictEqual( callback, click, "Registers notification callback" );
	};


	try {
		const inst = new NotificationProviderFreedesktop();
		data = new NotificationData({});
		await inst.notify( data );
	} catch ( e ) {
		assert.strictEqual( e.message, "fail notify", "Notify fail" );
	}

	failNotify = false;
	data = new NotificationData({
		title: "title",
		message: "message",
		icon: "icon-path",
		click
	});
	expectedMessage = "message";

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.notify( data );
	} catch ( e ) {
		throw e;
	}

	data.message = [
		{ title: "foo" },
		{ title: "bar" }
	];
	expectedMessage = "foo, bar";

	try {
		const inst = new NotificationProviderFreedesktop();
		await inst.notify( data );
	} catch ( e ) {
		throw e;
	}

});


test( "Callbacks", assert => {

	assert.expect( 10 );

	let deleteCallback;

	const { default: NotificationProviderFreedesktop } = notificationProviderFreedesktopInjector({
		config,
		"nwjs/Window": {
			window: {
				setTimeout( callback, time ) {
					assert.ok( callback instanceof Function, "Has a delete callback" );
					assert.strictEqual( time, 2000, "Sets the expiration time in msecs" );
					deleteCallback = callback;
					return 1234;
				},
				clearTimeout( timeout ) {
					assert.strictEqual( timeout, 1234, "Clears timeout" );
				}
			}
		},
		"models/localstorage/Settings": {},
		"utils/node/platform": {},
		"dbus-native": {}
	});

	const inst = new NotificationProviderFreedesktop();
	inst.callbacks = new Map();

	let callback = () => {};

	inst.registerCallback( 1, callback );
	assert.strictEqual( inst.callbacks.get( 1 ).callback, callback, "Callback is registered" );
	assert.strictEqual( inst.callbacks.get( 1 ).expire, 1234, "Has an expiration timeout" );

	deleteCallback();
	assert.notOk( inst.callbacks.has( 1 ), "Removes callback once it expires" );

	inst.registerCallback( 2, callback );
	assert.strictEqual( inst.callbacks.size, 1, "Callbacks has a size of one" );
	inst.unregisterCallback( 2 );
	assert.strictEqual( inst.callbacks.size, 0, "Callbacks are empty" );

});
