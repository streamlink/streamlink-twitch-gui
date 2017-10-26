import {
	module,
	test
} from "qunit";
import { EventTarget } from "dom-utils";
import notificationProviderNativeInjector
	from "inject-loader!services/NotificationService/providers/native";
import NotificationData from "services/NotificationService/data";


module( "services/NotificationService/providers/native" );


test( "isSupported", assert => {

	let NotificationProviderNative;

	NotificationProviderNative = notificationProviderNativeInjector({
		"nwjs/Window": {
			window: {}
		},
		"utils/node/platform": {
			isDarwin: true,
			isLinux: false
		}
	})[ "default" ];

	assert.ok( NotificationProviderNative.isSupported(), "Supported on macOS" );

	NotificationProviderNative = notificationProviderNativeInjector({
		"nwjs/Window": {
			window: {}
		},
		"utils/node/platform": {
			isDarwin: false,
			isLinux: true
		}
	})[ "default" ];

	assert.ok( NotificationProviderNative.isSupported(), "Supported on Linux" );

	NotificationProviderNative = notificationProviderNativeInjector({
		"nwjs/Window": {
			window: {}
		},
		"utils/node/platform": {
			isDarwin: false,
			isLinux: false
		}
	})[ "default" ];

	assert.notOk( NotificationProviderNative.isSupported(), "Not supported on other OSes" );

});


test( "setup", async assert => {

	const { default: NotificationProviderNative } = notificationProviderNativeInjector({
		"utils/node/platform": {},
		"nwjs/Window": {
			window: {}
		}
	});

	await new NotificationProviderNative().setup();
	assert.ok( true, "Setup returns resolved promise" );

});


test( "notify", async assert => {

	assert.expect( 8 );

	let notification;
	let expectedMessage;

	class Notification extends EventTarget {
		constructor( title, options ) {
			super();
			notification = this;
			assert.strictEqual( title, "foo", "Sets notification title" );
			assert.propEqual( options, {
				body: expectedMessage,
				icon: "file://icon-path",
				actions: []
			}, "Sets notification options" );
		}
	}

	const { default: NotificationProviderNative } = notificationProviderNativeInjector({
		"utils/node/platform": {},
		"nwjs/Window": {
			window: {
				Notification
			}
		}
	});

	const inst = new NotificationProviderNative();
	const data = new NotificationData({
		title: "foo",
		message: "bar",
		icon: "icon-path",
		click() {
			assert.ok( true, "Executes click callback" );
		}
	});

	expectedMessage = "bar";

	try {
		const promise = inst.notify( data );
		notification.dispatchEvent( new Event( "error" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Could not show notification", "Rejects on error" );
	}

	data.message = [
		{ title: "bar" },
		{ title: "baz" }
	];
	expectedMessage = "bar, baz";

	try {
		const promise = inst.notify( data );
		notification.dispatchEvent( new Event( "show" ) );
		await promise;
		notification.dispatchEvent( new Event( "click" ) );
	} catch ( e ) {
		throw e;
	}

	data.click = null;

	try {
		const promise = inst.notify( data );
		notification.dispatchEvent( new Event( "show" ) );
		await promise;
		notification.dispatchEvent( new Event( "click" ) );
	} catch ( e ) {
		throw e;
	}

});
