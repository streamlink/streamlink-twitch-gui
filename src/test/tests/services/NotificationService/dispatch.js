import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import {
	set,
	Service
} from "ember";
import notificationServiceDispatchMixinInjector
	from "inject-loader?-ember!services/NotificationService/dispatch";


let owner;


module( "services/NotificationService/dispatch", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:chat", Service.extend() );
		owner.register( "service:-routing", Service.extend() );
		owner.register( "service:settings", Service.extend({
			notification: {}
		}) );
		owner.register( "service:streaming", Service.extend() );
	},
	afterEach() {
		runDestroy( owner );
		owner = null;
	}
});


test( "dispatchNotifications", async assert => {

	assert.expect( 12 );

	const streamA = {};
	const streamB = {};
	const expectedDownload = [];
	const expectedNotif = [];

	const { default: NotificationServiceDispatchMixin } = notificationServiceDispatchMixinInjector({
		"models/localstorage/Settings/notification": {},
		"nwjs/Window": {},
		"./logger": {},
		"./provider": {},
		"./icons": {
			async iconDownload( stream ) {
				assert.step( "download" );
				assert.strictEqual( stream, expectedDownload.shift(), "Downloads stream icon" );
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationServiceDispatchMixin, {
		async _showNotificationGroup( streams ) {
			assert.step( "group" );
			assert.propEqual( streams, [ streamA, streamB ], "Shows group notification" );
		},
		async _showNotificationSingle( stream ) {
			assert.step( "single" );
			assert.strictEqual( stream, expectedNotif.shift(), "Shows the single notification" );
		}
	}) );

	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	set( settings, "notification.grouping", true );
	await service.dispatchNotifications([ streamA, streamB ]);
	assert.checkSteps( [ "group" ], "Shows group notification" );

	set( settings, "notification.grouping", false );
	expectedDownload.push( streamA, streamB );
	expectedNotif.push( streamA, streamB );
	await service.dispatchNotifications([ streamA, streamB ]);
	assert.checkSteps(
		[ "download", "download", "single", "single" ],
		"Shows two single notifications"
	);

});


test( "Group and single notifications", async assert => {

	assert.expect( 9 );

	let expectedNotification, expectedSettings, expectedStreams;
	let notification;

	const streamA = {
		channel: {
			display_name: "foo",
			status: "123"
		},
		logo: "logo"
	};
	const streamB = {
		channel: {
			display_name: "bar"
		}
	};

	const { default: NotificationServiceDispatchMixin } = notificationServiceDispatchMixinInjector({
		"models/localstorage/Settings/notification": {},
		"nwjs/Window": {},
		"./logger": {},
		"./provider": {},
		"./icons": {
			iconGroup: "group-icon"
		}
	});

	owner.register( "service:notification", Service.extend( NotificationServiceDispatchMixin, {
		async _showNotification( data ) {
			assert.propEqual( data, expectedNotification, "Shows the notification" );
			return data;
		},
		_notificationClick( settings, streams ) {
			assert.strictEqual( settings, expectedSettings, "Calls notification click callback" );
			assert.propEqual( streams, expectedStreams, "Has the correct streams on click" );
		}
	}) );

	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	// show group notification
	expectedStreams = [ streamA, streamB ];
	expectedSettings = 1;
	expectedNotification = {
		title: "Some followed channels have started streaming",
		message: [{
			title: "foo",
			message: "123"
		}, {
			title: "bar",
			message: ""
		}],
		icon: "group-icon",
		click: () => {},
		settings: expectedSettings
	};
	set( settings, "notification.click_group", expectedSettings );
	notification = await service._showNotificationGroup([ streamA, streamB ]);
	notification.click();

	// show single notification
	expectedStreams = [ streamA ];
	expectedSettings = 2;
	expectedNotification = {
		title: "foo has started streaming",
		message: "123",
		icon: "logo",
		click: () => {},
		settings: expectedSettings
	};
	set( settings, "notification.click", expectedSettings );
	notification = await service._showNotificationSingle( streamA );
	notification.click();

	// show single notification
	expectedStreams = [ streamB ];
	expectedSettings = 3;
	expectedNotification = {
		title: "bar has started streaming",
		message: "",
		icon: "group-icon",
		click: () => {},
		settings: expectedSettings
	};
	set( settings, "notification.click", expectedSettings );
	notification = await service._showNotificationSingle( streamB );
	notification.click();

});


test( "Notification click", async assert => {

	const ATTR_NOTIFY_CLICK_NOOP = 0;
	const ATTR_NOTIFY_CLICK_FOLLOWED = 1;
	const ATTR_NOTIFY_CLICK_STREAM = 2;
	const ATTR_NOTIFY_CLICK_STREAMANDCHAT = 3;

	const channelA = {};
	const channelB = {};
	const streamA = { channel: channelA };
	const streamB = { channel: channelB };

	let expectedChats = [];
	let expectedStreams = [];

	let fail = false;
	let promise;

	const { default: NotificationServiceDispatchMixin } = notificationServiceDispatchMixinInjector({
		"./provider": {},
		"./icons": {},
		"models/localstorage/Settings/notification": {
			ATTR_NOTIFY_CLICK_NOOP,
			ATTR_NOTIFY_CLICK_FOLLOWED,
			ATTR_NOTIFY_CLICK_STREAM,
			ATTR_NOTIFY_CLICK_STREAMANDCHAT
		},
		"nwjs/Window": {
			setMinimized( val ) {
				assert.step( "setMinimized" );
				assert.strictEqual( val, false, "Unminimized window" );
			},
			setVisibility( val ) {
				assert.step( "setVisibility" );
				assert.strictEqual( val, true, "Shows window" );
			},
			setFocused( val ) {
				assert.step( "setFocused" );
				assert.strictEqual( val, true, "Focuses window" );
			}
		},
		"./logger": {
			logDebug() {
				assert.step( "logDebug" );
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationServiceDispatchMixin ) );

	owner.lookup( "service:-routing" ).reopen({
		transitionTo( route ) {
			assert.step( "transitionTo" );
			assert.strictEqual( route, "user.followedStreams", "Transitions to followed streams" );
		}
	});
	owner.lookup( "service:streaming" ).reopen({
		async startStream( stream ) {
			assert.step( "startStream" );
			assert.strictEqual( stream, expectedStreams.shift(), "Launches correct stream" );
			if ( fail ) {
				promise = new Promise( resolve => setTimeout( resolve, 1 ) );
				throw new Error( "fail" );
			}
		}
	});
	owner.lookup( "service:chat" ).reopen({
		async open( channel ) {
			assert.step( "chat" );
			assert.strictEqual( channel, expectedChats.shift(), "Opens correct chat channel" );
			if ( fail ) {
				promise = new Promise( resolve => setTimeout( resolve, 1 ) );
				throw new Error( "fail" );
			}
		}
	});

	const settings = owner.lookup( "service:settings" ).reopen({
		notification: {
			click_restore: false
		},
		gui_openchat: false
	});
	const service = owner.lookup( "service:notification" );

	service._notificationClick( ATTR_NOTIFY_CLICK_NOOP, [ streamA, streamB ] );
	assert.checkSteps( [], "Doesn't do anything" );

	service._notificationClick( ATTR_NOTIFY_CLICK_FOLLOWED, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", "transitionTo" ],
		"Transitions to the followed streams route"
	);

	expectedStreams.push( streamA, streamB );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAM, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", "startStream", "startStream" ],
		"Opens all streams"
	);

	expectedStreams.push( streamA, streamB );
	expectedChats.push( channelA, channelB );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAMANDCHAT, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", "startStream", "chat", "startStream", "chat" ],
		"Opens all streams and chats"
	);

	expectedStreams.push( streamA, streamB );
	set( settings, "gui_openchat", true );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAMANDCHAT, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", "startStream", "startStream" ],
		"Only starts streams when gui_openchat is set to true"
	);

	// restore
	set( settings, "notification.click_restore", true );
	const restoreSteps = [ "setMinimized", "setVisibility", "setFocused" ];

	service._notificationClick( ATTR_NOTIFY_CLICK_NOOP, [ streamA, streamB ] );
	assert.checkSteps( [], "Doesn't do anything" );

	service._notificationClick( ATTR_NOTIFY_CLICK_FOLLOWED, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", ...restoreSteps, "transitionTo" ],
		"Transitions to the followed streams route"
	);

	expectedStreams.push( streamA, streamB );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAM, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", ...restoreSteps, "startStream", "startStream" ],
		"Opens all streams"
	);

	expectedStreams.push( streamA, streamB );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAMANDCHAT, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", ...restoreSteps, "startStream", "startStream" ],
		"Only starts streams when gui_openchat is set to true"
	);

	expectedStreams.push( streamA, streamB );
	expectedChats.push( channelA, channelB );
	set( settings, "gui_openchat", false );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAMANDCHAT, [ streamA, streamB ] );
	assert.checkSteps(
		[ "logDebug", ...restoreSteps, "startStream", "chat", "startStream", "chat" ],
		"Opens all streams and chats"
	);

	// fail stream or chat
	fail = true;
	set( settings, "notification.click_restore", false );
	expectedStreams.push( streamA, streamB );
	expectedChats.push( channelA, channelB );
	service._notificationClick( ATTR_NOTIFY_CLICK_STREAMANDCHAT, [ streamA, streamB ] );
	await promise;
	assert.checkSteps(
		[ "logDebug", "startStream", "chat", "startStream", "chat" ],
		"Tries to open all streams and chats"
	);

});


test( "Show notficiation", async assert => {

	assert.expect( 9 );

	const notification = {};
	let failShowNotification = false;
	let promise, expectedProvider;

	const { default: NotificationServiceDispatchMixin } = notificationServiceDispatchMixinInjector({
		"models/localstorage/Settings/notification": {},
		"nwjs/Window": {},
		"./logger": {},
		"./icons": {},
		"./provider": {
			async showNotification( provider, data, newInst ) {
				assert.strictEqual( provider, expectedProvider, "Has the correct provider" );
				assert.strictEqual( data, notification, "Uses the correct notification data" );
				assert.strictEqual( newInst, false, "Uses cached providers" );
				promise = new Promise( resolve => setTimeout( resolve, 1 ) );
				await promise;
				if ( failShowNotification ) {
					throw new Error( "fail" );
				}
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationServiceDispatchMixin ) );

	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	expectedProvider = "provider";
	set( settings, "notification.provider", expectedProvider );
	service._showNotification( notification );
	await promise;

	expectedProvider = "auto";
	set( settings, "notification.provider", expectedProvider );
	service._showNotification( notification );
	await promise;

	// fail (doesn't throw exceptions)
	failShowNotification = true;
	service._showNotification( notification );
	await promise;

});
