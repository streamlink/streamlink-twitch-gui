import {
	module,
	test
} from "qunit";
import notificationProviderRichInjector
	from "inject-loader!services/NotificationService/providers/rich";
import NotificationData from "services/NotificationService/data";


const config = {
	main: {
		"display-name": "application name"
	}
};


module( "services/NotificationService/providers/rich" );


test( "isSupported", assert => {

	let NotificationProviderRich;

	NotificationProviderRich = notificationProviderRichInjector({
		config,
		"nwjs/Window": {
			window: {
				chrome: {}
			}
		},
		"utils/node/platform": {
			isWin7: true
		}
	})[ "default" ];

	assert.ok( NotificationProviderRich.isSupported(), "Is supported on Win7" );

	NotificationProviderRich = notificationProviderRichInjector({
		config,
		"nwjs/Window": {
			window: {
				chrome: {}
			}
		},
		"utils/node/platform": {
			isWin7: false
		}
	})[ "default" ];

	assert.notOk( NotificationProviderRich.isSupported(), "Is not supported on other OSes" );

});


test( "setup", async assert => {

	assert.expect( 15 );

	class RichNotificationEvent {
		constructor() {
			this.listeners = [];
		}

		getListeners() {
			return this.listeners;
		}

		addListener( callback ) {
			this.listeners.push({ callback });
		}

		removeListener( callback ) {
			const idx = this.listeners.findIndex( item => item.callback === callback );
			if ( idx !== -1 ) {
				this.listeners.splice( idx, 1 );
				assert.step( "removeListener" );
			}
		}

		trigger( ...args ) {
			this.listeners.forEach( listener => listener.callback( ...args ) );
		}
	}

	const notifications = {
		onClosed: new RichNotificationEvent(),
		onClicked: new RichNotificationEvent(),
		clear( id ) {
			assert.strictEqual( id, "2", "Clears second notification" );
		}
	};

	const { default: NotificationProviderRich } = notificationProviderRichInjector({
		config,
		"utils/node/platform": {},
		"nwjs/Window": {
			window: {
				chrome: {
					notifications
				}
			}
		}
	});

	// add event listeners (listeners don't get unregistered in dev mode when reloading)
	notifications.onClosed.addListener( () => {} );
	notifications.onClicked.addListener( () => {} );

	const inst = new NotificationProviderRich();
	await inst.setup();

	assert.checkSteps( [ "removeListener", "removeListener" ], "Removes previous listeners" );

	assert.strictEqual( inst.index, 0, "Sets callback index to zero" );
	assert.ok( inst.callbacks instanceof Map, "Registers callbacks map" );
	assert.strictEqual( inst.callbacks.size, 0, "Callbacks map is empty" );

	assert.strictEqual(
		notifications.onClosed.getListeners().length,
		1,
		"Has one onClosed event listener"
	);
	assert.strictEqual(
		notifications.onClicked.getListeners().length,
		1,
		"Has one onClosed event listener"
	);

	inst.callbacks.set( "1", () => {
		throw new Error();
	});
	inst.callbacks.set( "2", () => {
		assert.ok( true, "Calls click callback" );
	});
	assert.strictEqual( inst.callbacks.size, 2, "Register callbacks with ID '1' and '2'" );

	// trigger a notification close event on the first notification
	notifications.onClosed.trigger( "1" );
	assert.notOk( inst.callbacks.has( "1" ), "Callback '1' has been removed" );
	assert.ok( inst.callbacks.has( "2" ), "Callback '2' still exists" );

	notifications.onClicked.trigger( "2" );
	assert.ok( inst.callbacks.has( "2" ), "Callback '2' still exists after clicking '2'" );
	notifications.onClosed.trigger( "2" );
	assert.notOk( inst.callbacks.has( "2" ), "Callback '2' is now deleted after closing '2'" );

});


test( "notify", async assert => {

	assert.expect( 8 );

	let expectedId;
	let expectedData;

	const notifications = {
		create( id, data ) {
			assert.strictEqual( id, expectedId, "Creates notification" );
			assert.propEqual( data, expectedData, "Uses correct notification data" );
		}
	};

	const { default: NotificationProviderRich } = notificationProviderRichInjector({
		config,
		"utils/node/platform": {},
		"nwjs/Window": {
			window: {
				chrome: {
					notifications
				}
			}
		}
	});

	const inst = new NotificationProviderRich();
	inst.callbacks = new Map();
	inst.index = 0;

	const data = new NotificationData({
		title: "title",
		message: "message",
		icon: "icon-path",
		click() {}
	});

	expectedId = "1";
	expectedData = {
		type: "basic",
		title: "title",
		message: "message",
		iconUrl: "file://icon-path",
		contextMessage: "application name",
		isClickable: true
	};

	await inst.notify( data );

	assert.ok( inst.callbacks.has( "1" ), "Registers the click callback" );
	assert.strictEqual( inst.index, 1, "Increases the index by one" );

	data.message = [
		{ title: "foo" },
		{ title: "bar" }
	];
	expectedId = "2";
	expectedData.type = "list";
	expectedData.message = "";
	expectedData.items = data.message;

	await inst.notify( data );

	assert.ok( inst.callbacks.has( "2" ), "Registers the click callback" );
	assert.strictEqual( inst.index, 2, "Increases the index by one" );

});
