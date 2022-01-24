import { module, test } from "qunit";
import { buildResolver } from "test-utils";
import { FakeIntlService } from "intl-utils";

import { set } from "@ember/object";
import PromiseProxyMixin from "@ember/object/promise-proxy-mixin";
import ObjectProxy from "@ember/object/proxy";
import Service from "@ember/service";
import sinon from "sinon";

import notificationServiceDispatchMixinInjector
	from "inject-loader?./icons&./logger&./provider&nwjs/Window!services/notification/dispatch";
import {
	ATTR_NOTIFY_CLICK_NOOP,
	ATTR_NOTIFY_CLICK_FOLLOWED,
	ATTR_NOTIFY_CLICK_STREAM,
	ATTR_NOTIFY_CLICK_STREAMANDCHAT
} from "data/models/settings/notification/fragment";
import { setupTest } from "ember-qunit";


module( "services/notification/dispatch", function( hooks ) {
	// build our own PromiseObject in order to avoid importing from a private ember-data module
	// TODO: import from @ember-data/promise-proxies once it becomes available
	const PromiseObject = ObjectProxy.extend( PromiseProxyMixin );

	class FakeTwitchStream {
		constructor( stream, user, settings = {} ) {
			Object.assign( this, stream );
			this.user = PromiseObject.create({
				promise: Promise.resolve( user )
			});
			this.getChannelSettings = async () => settings;
		}
	}

	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService
		})
	});

	/** @typedef {TestContext} TestContextNotificationServiceDispatchMixin */
	/** @this {TestContextNotificationServiceDispatchMixin} */
	hooks.beforeEach(function() {
		this.iconDownloadStub = sinon.stub();
		this.logDebugSpy = sinon.spy();
		this.showNotificationStub = sinon.stub();
		this.setMinimizedSpy = sinon.spy();
		this.setVisibilitySpy = sinon.spy();
		this.setFocusedSpy = sinon.spy();
		this.transitionToSpy = sinon.spy();
		this.openChatStub = sinon.stub();
		this.startStreamStub = sinon.stub();

		const { default: subject } = notificationServiceDispatchMixinInjector({
			"./icons": {
				iconGroup: "group-icon-path",
				iconDownload: this.iconDownloadStub
			},
			"./logger": {
				logDebug: this.logDebugSpy
			},
			"./provider": {
				showNotification: this.showNotificationStub
			},
			"nwjs/Window": {
				setMinimized: this.setMinimizedSpy,
				setVisibility: this.setVisibilitySpy,
				setFocused: this.setFocusedSpy
			}
		});

		this.owner.register( "service:notification", Service.extend( subject ) );
		this.owner.register( "service:chat", Service.extend({
			openChat: this.openChatStub
		}) );
		this.owner.register( "service:router", Service.extend({
			transitionTo: this.transitionToSpy
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				notification: {},
				streams: {}
			}
		}) );
		this.owner.register( "service:streaming", Service.extend({
			startStream: this.startStreamStub
		}) );

		this.subject = this.owner.lookup( "service:notification" );
	});


	/** @this {TestContextNotificationServiceDispatchMixin} */
	test( "dispatchNotifications", async function( assert ) {
		const iconStub = this.iconDownloadStub;
		const groupStub = sinon.stub();
		const singleStub = sinon.stub();
		const showSpy = sinon.spy();

		function reset() {
			singleStub.reset();
			groupStub.reset();
			iconStub.resetHistory();
			showSpy.resetHistory();
		}

		this.subject.reopen({
			_getNotificationDataGroup: groupStub,
			_getNotificationDataSingle: singleStub,
			_showNotification: showSpy
		});

		const userA = { login: "foo", display_name: "Foo", profile_image_url: "iconA" };
		const userB = { login: "bar", display_name: "Bar", profile_image_url: "iconB" };
		const streamA = new FakeTwitchStream(
			{ id: "1", title: "123" },
			userA
		);
		const streamB = new FakeTwitchStream(
			{ id: "2", title: "321" },
			userB
		);

		iconStub.callsFake( async user => user.profile_image_url );

		// don't do anything on missing streams
		await this.subject.dispatchNotifications();
		assert.notOk( singleStub.called, "Does not create single notification" );
		assert.notOk( groupStub.called, "Does not create group notification" );
		assert.notOk( iconStub.called, "Does not download icons" );
		assert.notOk( showSpy.called, "Does not show notifications" );

		// don't do anything on empty streams
		await this.subject.dispatchNotifications( [] );
		assert.notOk( singleStub.called, "Does not create single notification" );
		assert.notOk( groupStub.called, "Does not create group notification" );
		assert.notOk( iconStub.called, "Does not download icons" );
		assert.notOk( showSpy.called, "Does not show notifications" );

		// enable grouping
		set( this.subject, "settings.content.notification.grouping", true );

		// show single notification on a single stream if grouping is enabled
		singleStub.returns({ one: 1 });
		await this.subject.dispatchNotifications([ streamA ]);
		assert.notOk( groupStub.called, "Does not create group notification" );
		assert.propEqual( iconStub.args, [[ userA ]], "Downloads icon" );
		assert.propEqual( singleStub.args, [[ streamA, "iconA" ]], "Creates single notification" );
		assert.ok( iconStub.calledBefore( singleStub ), "Downloads icon first" );
		assert.propEqual( showSpy.lastCall.args, [{ one: 1 }], "Shows notification" );
		reset();

		// show a group notification on multiple streams if grouping is enabled
		groupStub.returns({ two: 2 });
		await this.subject.dispatchNotifications([ streamA, streamB ]);
		assert.notOk( singleStub.called, "Does not show single notification" );
		assert.propEqual(
			groupStub.lastCall.args,
			[ [ streamA, streamB ] ],
			"Shows group notification"
		);
		assert.notOk( iconStub.called, "Does not download icons" );
		assert.propEqual( showSpy.lastCall.args, [{ two: 2 }], "Shows notification" );
		reset();

		// disable grouping
		set( this.subject, "settings.content.notification.grouping", false );

		// show multiple single notifications if grouping is disabled
		singleStub.onFirstCall().returns({ three: 3 });
		singleStub.onSecondCall().returns({ four: 4 });
		await this.subject.dispatchNotifications([ streamA, streamB ]);
		assert.notOk( groupStub.called, "Does not create group notification" );
		assert.propEqual( iconStub.args, [ [ userA ], [ userB ] ], "Downloads icons" );
		assert.propEqual(
			singleStub.args,
			[ [ streamA, "iconA" ], [ streamB, "iconB" ] ],
			"Creates single notifications"
		);
		assert.ok(
			iconStub.firstCall.calledBefore( singleStub.firstCall ),
			"Downloads icons first"
		);
		assert.ok(
			iconStub.lastCall.calledBefore( singleStub.lastCall ),
			"Downloads icons first"
		);
		assert.propEqual(
			showSpy.args,
			[ [ { three: 3 } ], [ { four: 4 } ] ],
			"Shows both notification"
		);
		reset();

		// fail icon download
		iconStub.onFirstCall().rejects( new Error( "fail" ) );
		singleStub.withArgs( streamA ).returns({ five: 5 });
		singleStub.withArgs( streamB ).returns({ six: 6 });
		await assert.rejects(
			this.subject.dispatchNotifications([ streamA, streamB ]),
			new Error( "fail" ),
			"Rejects on download error, but tries to show all notifications"
		);
		assert.notOk( groupStub.called, "Does not create group notification" );
		assert.propEqual( iconStub.args, [ [ userA ], [ userB ] ], "Downloads all icons" );
		assert.propEqual(
			singleStub.args,
			[ [ streamB, "iconB" ] ],
			"Creates second single notification"
		);
		assert.propEqual( showSpy.args, [ [{ six: 6 }] ], "Shows second notification" );
	});

	/** @this {TestContextNotificationServiceDispatchMixin} */
	test( "Group and single notification data", async function( assert ) {
		/** @type {NotificationData} notification */
		let notification;

		const streamA = new FakeTwitchStream(
			{ id: "1", title: "123" },
			{ login: "foo", display_name: "Foo" }
		);
		const streamB = new FakeTwitchStream(
			{ id: "2", title: "" },
			{ login: "bar", display_name: "Bar" }
		);

		const clickSpy = sinon.spy();

		this.subject.reopen({
			_notificationClick: clickSpy
		});

		// make sure the user relationship is loaded before running unit tests on these methods
		await Promise.all( [ streamA, streamB ].map( stream => stream.user.promise ) );

		// show group notification
		set( this.subject, "settings.content.notification.click_group", 1 );
		notification = this.subject._getNotificationDataGroup([ streamA, streamB ]);
		notification.click();
		assert.propEqual( notification, {
			title: "services.notification.dispatch.group",
			message: [{
				title: "Foo",
				message: "123"
			}, {
				title: "Bar",
				message: ""
			}],
			icon: "group-icon-path",
			click: () => {},
			settings: 1
		}, "Returns correct group notification data" );
		assert.propEqual( clickSpy.args, [ [ [ streamA, streamB ], 1 ] ], "Group click callback" );
		clickSpy.resetHistory();

		// show single notification with logo
		set( this.subject, "settings.content.notification.click", 2 );
		notification = this.subject._getNotificationDataSingle( streamA, "logo" );
		notification.click();
		assert.propEqual( notification, {
			title: "services.notification.dispatch.single{\"name\":\"Foo\"}",
			message: "123",
			icon: "logo",
			click: () => {},
			settings: 2
		}, "Returns correct single notification data" );
		assert.propEqual( clickSpy.args, [ [ [ streamA ], 2 ] ], "Single click callback" );
		clickSpy.resetHistory();

		// show single notification without logo
		set( this.subject, "settings.content.notification.click", 3 );
		notification = this.subject._getNotificationDataSingle( streamB );
		notification.click();
		assert.propEqual( notification, {
			title: "services.notification.dispatch.single{\"name\":\"Bar\"}",
			message: "",
			icon: "group-icon-path",
			click: () => {},
			settings: 3
		}, "Returns correct single notification data with group icon" );
		assert.propEqual( clickSpy.args, [ [ [ streamB ], 3 ] ], "Single click callback" );
	});

	/** @this {TestContextNotificationServiceDispatchMixin} */
	test( "Notification click", async function( assert ) {
		this.startStreamStub.rejects();
		this.openChatStub.rejects();

		const sA = new FakeTwitchStream(
			{ id: "1" },
			{ login: "lA", display_name: "nA" },
			{ streams_chat_open: null }
		);
		const sB = new FakeTwitchStream(
			{ id: "2" },
			{ login: "lB", display_name: "nB" },
			{ streams_chat_open: false }
		);
		const sC = new FakeTwitchStream(
			{ id: "3" },
			{ login: "lC", display_name: "nC" },
			{ streams_chat_open: true }
		);

		// noop
		await this.subject._notificationClick( [ sA, sB ], ATTR_NOTIFY_CLICK_NOOP );
		assert.notOk( this.logDebugSpy.called, "Doesn't do anything" );
		sinon.resetHistory();

		// restore GUI (only test ATTR_NOTIFY_CLICK_FOLLOWED)
		set( this.subject, "settings.content.notification.click_restore", true );

		// transitionTo with restore option
		await this.subject._notificationClick( [ sA, sB ], ATTR_NOTIFY_CLICK_FOLLOWED );
		assert.ok( this.logDebugSpy.called, "Logs click" );
		assert.propEqual(
			this.transitionToSpy.args,
			[ [ "user.followedStreams" ] ],
			"Shows followed"
		);
		assert.propEqual( this.setMinimizedSpy.args, [ [ false ] ], "Restore" );
		assert.ok( this.setMinimizedSpy.calledBefore( this.transitionToSpy ), "Restore first" );
		assert.propEqual( this.setVisibilitySpy.args, [ [ true ] ], "Unhide" );
		assert.ok( this.setVisibilitySpy.calledBefore( this.transitionToSpy ), "Unhide first" );
		assert.propEqual( this.setFocusedSpy.args, [ [ true ] ], "Focus" );
		assert.ok( this.setFocusedSpy.calledBefore( this.transitionToSpy ), "Focus first" );
		sinon.resetHistory();

		// disable restore option for now
		set( this.subject, "settings.content.notification.click_restore", false );

		// transitionTo
		await this.subject._notificationClick( [ sA, sB ], ATTR_NOTIFY_CLICK_FOLLOWED );
		assert.ok( this.logDebugSpy.called, "Logs click" );
		assert.notOk( this.setMinimizedSpy.called, "Does not restore" );
		assert.notOk( this.setVisibilitySpy.called, "Does not unhide" );
		assert.notOk( this.setFocusedSpy.called, "Does not focus" );
		assert.propEqual(
			this.transitionToSpy.args,
			[ [ "user.followedStreams" ] ],
			"Shows followed"
		);
		sinon.resetHistory();

		// launch streams and always resolve
		await this.subject._notificationClick( [ sA, sB, sC ], ATTR_NOTIFY_CLICK_STREAM );
		assert.ok( this.logDebugSpy.called, "Logs click" );
		assert.propEqual(
			this.startStreamStub.args,
			[ [ sA ], [ sB ], [ sC ] ],
			"Launches streams"
		);
		sinon.resetHistory();

		// launch streams+chats and always resolve (global open_chat is false)
		set( this.subject, "settings.content.streams.chat_open", false );
		await this.subject._notificationClick( [ sA, sB, sC ], ATTR_NOTIFY_CLICK_STREAMANDCHAT );
		assert.ok( this.logDebugSpy.called, "Logs click" );
		assert.propEqual(
			this.startStreamStub.args,
			[ [ sA ], [ sB ], [ sC ] ],
			"Launches streams"
		);
		assert.propEqual( this.openChatStub.args, [ [ "lA" ], [ "lB" ] ], "Opens chats A and B" );
		sinon.resetHistory();

		// launch streams+chats and always resolve (global open_chat is true)
		set( this.subject, "settings.content.streams.chat_open", true );
		await this.subject._notificationClick( [ sA, sB, sC ], ATTR_NOTIFY_CLICK_STREAMANDCHAT );
		assert.ok( this.logDebugSpy.called, "Logs click" );
		assert.propEqual(
			this.startStreamStub.args,
			[ [ sA ], [ sB ], [ sC ] ],
			"Launches streams"
		);
		assert.propEqual( this.openChatStub.args, [ [ "lB" ] ], "Opens chat B" );
	});

	/** @this {TestContextNotificationServiceDispatchMixin} */
	test( "Show notficiation", async function( assert ) {
		const settings = this.owner.lookup( "service:settings" );
		set( settings, "content.notification.provider", "provider" );

		const notification = { foo: 1 };

		// resolve
		this.showNotificationStub.resolves();
		await this.subject._showNotification( notification );
		assert.propEqual(
			this.showNotificationStub.args,
			[ [ "provider", notification, false ] ],
			"Shows notification"
		);
		this.showNotificationStub.reset();

		// reject
		this.showNotificationStub.rejects();
		await this.subject._showNotification( notification );
		assert.ok(
			this.showNotificationStub.called,
			"Doesn't reject when showNotification rejects"
		);
		this.showNotificationStub.reset();

		// reject later
		let reject;
		const promise = new Promise( ( _, r ) => reject = r );
		this.showNotificationStub.returns( promise );
		await this.subject._showNotification( notification );
		reject();
		assert.ok(
			this.showNotificationStub.called,
			"Doesn't reject when showNotification rejects"
		);
	});
});
