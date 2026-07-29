import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";
import { setTimeout } from "timers";

import { set } from "@ember/object";
import { on } from "@ember/object/evented";
import Service from "@ember/service";
import Model from "ember-data/model";

import notificationPollingMixinInjector
	from "inject-loader?config&./cache&./icons&./logger!services/notification/polling";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStreamFollowed from "data/models/twitch/stream-followed/model";
import TwitchStreamFollowedSerializer from "data/models/twitch/stream-followed/serializer";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";

import fixturesTwitchStreamFollowed from "fixtures/services/notification/polling.yml";


module( "services/notification/polling", function( hooks ) {
	const config = {
		notification: {
			fails: {
				requests: 2
			},
			interval: {
				request: 1,
				retry: 1,
				error: 1
			},
			query: {
				first: 2,
				maxQueries: 5
			}
		}
	};

	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			TwitchStreamFollowed,
			TwitchStreamFollowedSerializer,
			TwitchStream,
			TwitchStreamSerializer,
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchGame: Model.extend(),
			TwitchChannel: Model.extend()
		})
	});

	/** @typedef {TestContext} TestContextNotificationServicePollingMixin */
	/** @this {TestContextNotificationServicePollingMixin} */
	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );

		this.owner.register( "service:auth", Service.extend({
			session: {
				user_id: "123"
			}
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				notification: {}
			}
		}) );

		this.logErrorSpy = sinon.spy();
		this.cacheClearStub = sinon.stub();
		this.cacheFillStub = sinon.stub();
		this.iconDirCreateSpy = sinon.spy();
		this.iconDirClearSpy = sinon.spy();
		const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
			config,
			"./logger": {
				logError: this.logErrorSpy
			},
			"./cache": {
				cacheClear: this.cacheClearStub,
				cacheFill: this.cacheFillStub
			},
			"./icons": {
				iconDirCreate: this.iconDirCreateSpy,
				iconDirClear: this.iconDirClearSpy
			}
		});
		this.owner.register( "service:notification", Service.extend( NotificationPollingMixin ) );
	});


	/** @this {TestContextNotificationServicePollingMixin} */
	test( "Start / reset", async function( assert ) {
		/** @type {NotificatonServicePollingMixin} */
		const service = this.owner.lookup( "service:notification" );
		const startSpy = sinon.spy( service, "start" );
		const resetSpy = sinon.spy( service, "reset" );
		const pollStub = sinon.stub( service, "_poll" );

		// initialization
		assert.notOk( service.running, "Does not poll initially" );

		// turn polling on
		set( service, "running", true );
		await service._pollPromise;
		// Resets before each new start
		sinon.assert.callOrder(
			startSpy,
			resetSpy,
			this.cacheClearStub,
			this.iconDirCreateSpy,
			this.iconDirClearSpy,
			pollStub
		);
		assert.propEqual( pollStub.args, [[ true ]], "Calls _poll() with firstRun" );
		sinon.resetHistory();

		// turn polling off
		// fake a queued function call
		const errorOnNext = sinon.spy();
		set( service, "_pollNext", setTimeout( errorOnNext, 5 ) );
		set( service, "running", false );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		sinon.assert.callOrder( resetSpy, this.cacheClearStub );
		assert.notOk( errorOnNext.called, "Clears queued polling function" );
		assert.strictEqual( service._pollNext, null, "Unsets queued polling function" );

		// don't execute initialization twice
		set( service, "running", true );
		await service._pollPromise;
		assert.strictEqual( this.iconDirCreateSpy.callCount, 0, "Only initializes once" );
		assert.strictEqual( this.iconDirClearSpy.callCount, 0, "Only initializes once" );
		set( service, "running", false );
		sinon.resetHistory();

		// turn on and off without waiting for _poll() to resolve
		const pollPromise = new Promise( resolve => setTimeout( resolve, 10 ) );
		pollStub.callsFake( pollPromise );
		set( service, "running", true );
		set( service, "running", false );
		await pollPromise;
		// Executes all async functions in correct order
		sinon.assert.callOrder(
			startSpy,
			resetSpy,
			this.cacheClearStub,
			pollStub,
			resetSpy,
			this.cacheClearStub
		);

		// exceptions
		const error = new Error( "foo" );
		pollStub.rejects( error );
		set( service, "running", true );
		await service._pollPromise;
		assert.ok( this.logErrorSpy.calledWithExactly( error ) );
	});

	/** @this {TestContextNotificationServicePollingMixin} */
	test( "Polling", async function( assert ) {
		const streams = [ { id: 1 } ];

		const service = this.owner.lookup( "service:notification" );
		const resetSpy = sinon.spy( service, "reset" );
		const pollSpy = sinon.spy( service, "_poll" );
		const pollQueryStub = sinon.stub( service, "_pollQuery" ).resolves( streams );
		const pollResultStub = sinon.stub( service, "_pollResult" );
		const pollSuccessSpy = sinon.spy( service, "_pollSuccess" );
		const pollFailureSpy = sinon.spy( service, "_pollFailure" );
		const pollRequeueStub = sinon.stub( service, "_pollRequeue" );

		service.reopen({
			// manually start/stop polling
			_pollObserver: null
		});

		// not running
		await service._poll();
		assert.notOk( pollQueryStub.called, "Doesn't do anything if not running" );

		// running now... (observer disabled in this test)
		set( service, "running", true );

		// successful poll without queue
		await service._poll( true );
		// Executes all methods in correct order
		sinon.assert.callOrder(
			pollQueryStub,
			pollResultStub,
			pollSuccessSpy
		);
		sinon.resetHistory();

		// disable polling while querying
		let promise = service._poll( true );
		set( service, "running", false );
		await promise;
		assert.ok( pollQueryStub.calledOnce, "Queries streams" );
		assert.notOk( pollResultStub.called, "Doesn't dispatch notifications" );
		assert.notOk( pollSuccessSpy.called, "Doesn't requeue polling" );
		set( service, "running", true );
		sinon.resetHistory();

		// requeue on success
		pollRequeueStub.callThrough();
		await service._poll( true );
		assert.ok(
			pollResultStub.calledOnceWithExactly( streams, true ),
			"Passes streams to _pollResult with firstRun being true"
		);
		sinon.assert.callOrder(
			pollQueryStub, pollResultStub, pollSuccessSpy, pollRequeueStub
		);
		sinon.resetHistory();

		await service._pollPromise;
		assert.ok(
			pollResultStub.calledOnceWithExactly( streams, false ),
			"Passes new streams to _pollResult with firstRun being false"
		);
		sinon.assert.callOrder(
			pollQueryStub, pollResultStub, pollSuccessSpy, pollRequeueStub
		);
		sinon.resetHistory();

		pollRequeueStub.reset();
		await service._pollPromise;
		// Executes all methods in correct order when queuing
		sinon.assert.callOrder(
			pollQueryStub, pollResultStub, pollSuccessSpy
		);
		sinon.resetHistory();

		// requeue on failure
		pollQueryStub.rejects( new Error() );
		pollRequeueStub.callThrough();
		await service._poll( true );
		assert.propEqual( pollSpy.args, [[ true ]], "First poll attempt" );
		assert.notOk( resetSpy.called, "Doesn't call reset yet" );
		assert.strictEqual( service._pollTries, 1, "Increases tries count on failure" );
		assert.strictEqual( service.error, false, "Doesn't report an error yet" );
		sinon.assert.callOrder(
			pollQueryStub, pollFailureSpy, pollRequeueStub
		);
		sinon.resetHistory();

		await service._pollPromise;
		assert.propEqual( pollSpy.args, [[ false ]], "Second poll attempt" );
		assert.notOk( resetSpy.called, "Doesn't call reset yet" );
		assert.strictEqual( service._pollTries, 2, "Increases tries count on failure" );
		assert.strictEqual( service.error, false, "Doesn't report an error yet" );
		sinon.assert.callOrder(
			pollQueryStub, pollFailureSpy, pollRequeueStub
		);
		sinon.resetHistory();

		await service._pollPromise;
		assert.propEqual( pollSpy.args, [[ false ]], "Third poll attempt" );
		assert.strictEqual( service._pollTries, 0, "Resets tries count on last failure" );
		assert.strictEqual( service.error, true, "Reports an error now" );
		sinon.assert.callOrder(
			pollQueryStub, pollFailureSpy, resetSpy, pollRequeueStub
		);
		sinon.resetHistory();
		assert.ok( service._pollNext, "Keeps polling" );

		service.reset();
		assert.notOk( service._pollNext, "Clears poll queue" );
	});

	/** @this {TestContextNotificationServicePollingMixin} */
	test( "Polling results", async function( assert ) {
		const allStreams = [ { id: 1 }, { id: 2 } ];
		const newStreams = [ ...allStreams ];
		const filteredStreams = [ ...newStreams ];
		let error;

		this.cacheFillStub.callsFake( () => newStreams );

		const filterStreamsStub = sinon.stub().callsFake( async () => filteredStreams );
		const onStreamsAllSpy = sinon.spy();
		const onStreamsNewSpy = sinon.spy();
		const onStreamsFilteredSpy = sinon.spy();

		const service = this.owner.lookup( "service:notification" );
		service.reopen({
			_filterStreams: filterStreamsStub,
			_onAllStreams: on( "streams-all", onStreamsAllSpy ),
			_onNewStreams: on( "streams-new", onStreamsNewSpy ),
			_onFilteredStreams: on( "streams-filtered", onStreamsFilteredSpy )
		});

		// success

		await service._pollResult( allStreams, true );
		assert.ok(
			onStreamsAllSpy.calledOnceWithExactly( allStreams ),
			"Triggers streams-all"
		);
		assert.ok(
			this.cacheFillStub.calledOnceWithExactly( allStreams, true ),
			"Calls cacheFill"
		);
		assert.ok(
			onStreamsNewSpy.calledOnceWithExactly( newStreams ),
			"Triggers streams-new"
		);
		assert.ok(
			filterStreamsStub.calledOnceWithExactly( newStreams ),
			"Passes new streams to filterStreams"
		);
		assert.ok(
			onStreamsFilteredSpy.calledOnceWithExactly( filteredStreams ),
			"Triggers streams-filtered"
		);
		sinon.assert.callOrder(
			onStreamsAllSpy,
			this.cacheFillStub,
			onStreamsNewSpy,
			filterStreamsStub,
			onStreamsFilteredSpy
		);

		// catch all exceptions thrown by event listeners

		error = new Error( "streams-filtered" );
		service.reopen({
			_onFilteredStreamsFailure: on( "streams-filtered", sinon.stub().throws( error ) )
		});
		await service._pollResult( allStreams, true );
		assert.ok( this.logErrorSpy.calledOnceWith( error ), "Logs the streams-filtered error" );
		this.logErrorSpy.resetHistory();

		error = new Error( "streams-new" );
		service.reopen({
			_onNewStreamsFailure: on( "streams-new", sinon.stub().throws( error ) )
		});
		await service._pollResult( allStreams, true );
		assert.ok( this.logErrorSpy.calledOnceWith( error ), "Logs the streams-new error" );
		this.logErrorSpy.resetHistory();

		error = new Error( "streams-all" );
		service.reopen({
			_onAllStreamsFailure: on( "streams-all", sinon.stub().throws( error ) )
		});
		await service._pollResult( allStreams, true );
		assert.ok( this.logErrorSpy.calledOnceWith( error ), "Logs the streams-all error" );
	});

	/** @this {TestContextNotificationServicePollingMixin} */
	test( "Query streams", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub
			= store.adapterFor( "twitch-stream-followed" ).ajax
			= adapterRequestFactory( assert, fixturesTwitchStreamFollowed );

		const service = this.owner.lookup( "service:notification" );
		const streams = await service._pollQuery();
		assert.propEqual(
			streams.mapBy( "id" ),
			[ "1", "2", "3", "4", "5" ],
			"Returns all streams without duplicates"
		);
		assert.strictEqual( responseStub.callCount, 3, "Queries API 3 times" );
	});

	/** @this {TestContextNotificationServicePollingMixin} */
	test( "Filter streams", async function( assert ) {
		let streams;

		class FakeTwitchStream {
			constructor( id, isVodcast, settings ) {
				this.id = id;
				this.isVodcast = isVodcast;
				this.getChannelSettings = async () => settings;
			}
		}

		const twitchStreams = [
			new FakeTwitchStream( 1, false, { notification_enabled: null } ),
			new FakeTwitchStream( 2, false, { notification_enabled: true } ),
			new FakeTwitchStream( 3, false, { notification_enabled: false } ),
			new FakeTwitchStream( 4, true, { notification_enabled: null } ),
			new FakeTwitchStream( 5, true, { notification_enabled: true } ),
			new FakeTwitchStream( 6, true, { notification_enabled: false } )
		];

		const service = this.owner.lookup( "service:notification" );

		set( service, "settings.content.notification.filter_vodcasts", false );

		set( service, "settings.content.notification.filter", true );
		streams = await service._filterStreams( twitchStreams );
		assert.propEqual(
			streams.map( stream => stream.id ),
			[ 1, 2, 4, 5 ],
			"Return unknown and enabled streams and ignore vodcast settings"
		);

		set( service, "settings.content.notification.filter", false );
		streams = await service._filterStreams( twitchStreams );
		assert.propEqual(
			streams.map( stream => stream.id ),
			[ 2, 5 ],
			"Return enabled streams and ignore vodcast settings"
		);

		set( service, "settings.content.notification.filter_vodcasts", true );

		set( service, "settings.content.notification.filter", true );
		streams = await service._filterStreams( twitchStreams );
		assert.propEqual(
			streams.map( stream => stream.id ),
			[ 1, 2 ],
			"Return unknown, enabled and live streams"
		);

		set( service, "settings.content.notification.filter", false );
		streams = await service._filterStreams( twitchStreams );
		assert.propEqual(
			streams.map( stream => stream.id ),
			[ 2 ],
			"Return enabled and live streams"
		);
	});
});
