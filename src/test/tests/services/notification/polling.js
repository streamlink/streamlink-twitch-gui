import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import { I18nService } from "i18n-utils";
import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import RESTAdapter from "ember-data/adapters/rest";

import notificationPollingMixinInjector
	from "inject-loader?config&./cache&./icons&./logger!services/notification/polling";
import StreamFollowed from "data/models/twitch/stream-followed/model";
import StreamFollowedSerializer from "data/models/twitch/stream-followed/serializer";
import Stream from "data/models/twitch/stream/model";
import StreamSerializer from "data/models/twitch/stream/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";


const { later } = run;

let owner, env;

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
			limit: 2
		}
	}
};


module( "services/notification/polling", {
	beforeEach() {
		owner = buildOwner();

		env = setupStore( owner, { adapter: RESTAdapter } );

		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend({
			notification: {}
		}) );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Start / reset", async assert => {

	assert.expect( 33 );

	const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
		config,
		"./logger": {
			logError( e ) {
				assert.strictEqual( e.message, "foo", "Calls logError" );
			}
		},
		"./cache": {
			cacheClear() {
				assert.step( "cacheClear" );
			}
		},
		"./icons": {
			iconDirCreate() {
				assert.step( "iconDirCreate" );
			},
			iconDirClear() {
				assert.step( "iconDirClear" );
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationPollingMixin, {
		start() {
			assert.step( "start" );
			return this._super( ...arguments );
		},
		reset() {
			assert.step( "reset" );
			return this._super( ...arguments );
		},
		_poll( firstRun ) {
			assert.step( "poll" );
			assert.ok( firstRun, "Sets the firstRun parameter" );
		}
	}) );
	const service = owner.lookup( "service:notification" );

	// initialization
	assert.notOk( get( service, "running" ), "Does not poll initially" );

	// turn polling on
	run( () => set( service, "running", true ) );
	await service._pollPromise;
	assert.checkSteps(
		[ "start", "reset", "cacheClear", "iconDirCreate", "iconDirClear", "poll" ],
		"Resets before each new start"
	);

	// turn polling off
	run( () => {
		// fake a queued function call
		set( service, "_pollNext", later( () => {
			throw new Error();
		}, 5 ) );
		set( service, "running", false );
	});
	assert.checkSteps( [ "reset", "cacheClear" ], "Resets" );
	assert.strictEqual( get( service, "_pollNext" ), null, "Clears queued polling function" );

	// don't execute initialization twice
	run( () => set( service, "running", true ) );
	await service._pollPromise;
	assert.checkSteps(
		[ "start", "reset", "cacheClear", "poll" ],
		"Doesn't execute initialization twice"
	);
	run( () => set( service, "running", false ) );
	assert.clearSteps();

	// turn on and off without waiting for _poll() to resolve
	run( () => set( service, "running", true ) );
	await service._pollInitializedPromise;
	run( () => set( service, "running", false ) );
	assert.checkSteps(
		[ "start", "reset", "cacheClear", "poll", "reset", "cacheClear" ],
		"Executes all async functions in correct order"
	);

	// exceptions
	service.reopen({
		_poll() {
			throw new Error( "foo" );
		}
	});
	run( () => set( service, "running", true ) );
	await service._pollPromise;

});


test( "Polling", async assert => {

	assert.expect( 46 );

	let streams;
	let expectFirstRun = true;
	let requeue = false;
	let failQuery = false;

	const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
		config,
		"./logger": {
			logError( e ) {
				assert.strictEqual( e.message, "foo", "Calls logError" );
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationPollingMixin, {
		// manually start/stop polling
		_pollObserver: null,
		reset() {
			assert.step( "reset" );
			return this._super( ...arguments );
		},
		async _pollQuery() {
			assert.step( "query" );
			if ( failQuery ) {
				throw new Error();
			}
			streams = [ { id: 1 } ];
			return streams;
		},
		async _pollResult( allStreams, firstRun ) {
			assert.step( "result" );
			assert.strictEqual( allStreams, streams, "passes streams to queryResult" );
			assert.strictEqual( firstRun, expectFirstRun, "passes firstRun to queryResult" );
		},
		_pollSuccess() {
			assert.step( "success" );
			return this._super( ...arguments );
		},
		_pollFailure() {
			assert.step( "failure" );
			return this._super( ...arguments );
		},
		_pollRequeue() {
			if ( requeue ) {
				assert.step( "requeue" );
				return this._super( ...arguments );
			}
		}
	}) );

	const service = owner.lookup( "service:notification" );

	// not running
	await service._poll();
	assert.checkSteps( [], "Doesn't do anything if not running" );

	// running now... (observer disabled in this test)
	run( () => set( service, "running", true ) );

	// successful poll without queue
	await service._poll( true );
	assert.checkSteps(
		[ "query", "result", "success" ],
		"Executes all methods in correct order"
	);

	// disable polling while querying
	let promise = service._poll( true );
	run( () => set( service, "running", false ) );
	await promise;
	assert.checkSteps( [ "query" ], "Only gets streams and doesn't dispatch notifications" );
	run( () => set( service, "running", true ) );

	// requeue on success
	requeue = true;
	await service._poll( true );
	expectFirstRun = false;
	await service._pollPromise;
	requeue = false;
	await service._pollPromise;
	expectFirstRun = true;
	assert.checkSteps(
		[
			"query", "result", "success", "requeue",
			"query", "result", "success", "requeue",
			"query", "result", "success"
		],
		"Executes all methods in correct order when queuing"
	);

	// requeue on failure
	requeue = true;
	failQuery = true;
	await service._poll( true );
	assert.strictEqual( get( service, "_pollTries" ), 1, "Increases the tries count on failure" );
	assert.strictEqual( get( service, "error" ), false, "Doesn't report an error yet" );
	expectFirstRun = false;
	await service._pollPromise;
	assert.strictEqual( get( service, "_pollTries" ), 2, "Increases the tries count on failure" );
	assert.strictEqual( get( service, "error" ), false, "Doesn't report an error yet" );
	await service._pollPromise;
	assert.strictEqual( get( service, "_pollTries" ), 0, "Resets tries count on final failure" );
	assert.strictEqual( get( service, "error" ), true, "Reports an error now" );
	assert.checkSteps(
		[
			"query", "failure", "requeue",
			"query", "failure", "requeue",
			"query", "failure", "reset", "requeue"
		],
		"Executes all methods in correct order when queuing and failing"
	);
	assert.ok( get( service, "_pollNext" ), "Keeps polling" );
	service.reset();
	assert.clearSteps();
	requeue = false;
	failQuery = false;
	expectFirstRun = true;

});


test( "Polling results", async assert => {

	assert.expect( 35 );

	const allStreams = [ { id: 1 }, { id: 2 } ];
	let newStreams, filteredStreams, expectedErr;

	const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
		config,
		"./logger": {
			logError( err ) {
				assert.strictEqual( err.message, expectedErr, "Logs the caught error" );
			}
		},
		"./cache": {
			cacheFill( streams, firstRun ) {
				assert.step( "cacheFill" );
				assert.strictEqual( streams, allStreams, "Passes all streams to cacheFill" );
				assert.strictEqual( firstRun, true, "Passes the firstRun param to cacheFill" );
				newStreams = [ ...streams ];
				return newStreams;
			}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationPollingMixin, {
		async _filterStreams( streams ) {
			assert.step( "filterStreams" );
			assert.strictEqual( streams, newStreams, "Passes new streams to filterStreams" );
			filteredStreams = [ ...streams ];
			return filteredStreams;
		},
		_onAllStreams: on( "streams-all", function( streams ) {
			assert.strictEqual( streams, allStreams, "Triggers streams-all" );
			assert.step( "streams-all" );
		}),
		_onNewStreams: on( "streams-new", function( streams ) {
			assert.strictEqual( streams, newStreams, "Triggers streams-new" );
			assert.step( "streams-new" );
		}),
		_onFilteredStreams: on( "streams-filtered", function( streams ) {
			assert.strictEqual( streams, filteredStreams, "Triggers streams-filtered" );
			assert.step( "streams-filtered" );
		})
	}) );

	const service = owner.lookup( "service:notification" );

	// success
	await service._pollResult( allStreams, true );
	assert.checkSteps(
		[ "streams-all", "cacheFill", "streams-new", "filterStreams", "streams-filtered" ],
		"Has the correct method and event order"
	);

	// catch all exceptions thrown by event listeners
	service.reopen({
		_onFilteredStreamsFailure: on( "streams-filtered", () => {
			throw new Error( "streams-filtered" );
		})
	});
	expectedErr = "streams-filtered";
	await service._pollResult( allStreams, true );

	service.reopen({
		_onNewStreamsFailure: on( "streams-new", () => {
			throw new Error( "streams-new" );
		})
	});
	expectedErr = "streams-new";
	await service._pollResult( allStreams, true );

	service.reopen({
		_onAllStreamsFailure: on( "streams-all", () => {
			throw new Error( "streams-all" );
		})
	});
	expectedErr = "streams-all";
	await service._pollResult( allStreams, true );

});


test( "Query streams", async assert => {

	assert.expect( 4 );

	const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
		config,
		"./logger": {
			logError() {}
		}
	});

	const { default: TwitchImage } = imageInjector({
		config: {
			vars: {}
		}
	});

	owner.register( "model:twitch-stream-followed", StreamFollowed );
	owner.register( "serializer:twitch-stream-followed", StreamFollowedSerializer );
	owner.register( "model:twitch-stream", Stream );
	owner.register( "serializer:twitch-stream", StreamSerializer );
	owner.register( "model:twitch-channel", Channel );
	owner.register( "serializer:twitch-channel", ChannelSerializer );
	owner.register( "model:twitch-image", TwitchImage );
	owner.register( "serializer:twitch-image", ImageSerializer );

	owner.register( "service:notification", Service.extend( NotificationPollingMixin ) );

	let calls = 0;
	env.adapter.ajax = async ( url, method, query ) => {
		switch ( ++calls ) {
			case 1:
				assert.propEqual( query, { data: { offset: 0, limit: 2 } }, "First query" );
				return {
					streams: [
						{ _id: 1, channel: { _id: 1 } },
						{ _id: 2, channel: { _id: 2 } }
					]
				};
			case 2:
				assert.propEqual( query, { data: { offset: 2, limit: 2 } }, "Second query" );
				return {
					streams: [
						{ _id: 3, channel: { _id: 3 } },
						{ _id: 4, channel: { _id: 4 } }
					]
				};
			case 3:
				assert.propEqual( query, { data: { offset: 4, limit: 2 } }, "Third query" );
				return {
					streams: [
						{ _id: 4, channel: { _id: 4 } }
					]
				};
		}
		throw new Error();
	};

	const service = owner.lookup( "service:notification" );

	let streams = await service._pollQuery();
	assert.strictEqual( get( streams, "length" ), 4, "Returns all streams and removes duplicates" );

});


test( "Filter streams", async assert => {

	let streams;

	const { default: NotificationPollingMixin } = notificationPollingMixinInjector({
		config,
		"./logger": {
			logError() {}
		}
	});

	owner.register( "service:notification", Service.extend( NotificationPollingMixin ) );

	class TwitchStream {
		constructor( id, isVodcast, settings ) {
			this.id = id;
			this.isVodcast = isVodcast;
			this.channel = {
				async getChannelSettings() {
					return settings;
				}
			};
		}
	}

	const twitchStreams = [
		new TwitchStream( 1, false, { notification_enabled: null } ),
		new TwitchStream( 2, false, { notification_enabled: true } ),
		new TwitchStream( 3, false, { notification_enabled: false } ),
		new TwitchStream( 4, true, { notification_enabled: null } ),
		new TwitchStream( 5, true, { notification_enabled: true } ),
		new TwitchStream( 6, true, { notification_enabled: false } )
	];

	const service = owner.lookup( "service:notification" );
	const settings = owner.lookup( "service:settings" );

	set( settings, "notification.filter_vodcasts", false );

	set( settings, "notification.filter", true );
	streams = await service._filterStreams( twitchStreams );
	assert.propEqual(
		streams.map( stream => stream.id ),
		[ 1, 2, 4, 5 ],
		"Return unknown and enabled streams and ignore vodcast settings"
	);

	set( settings, "notification.filter", false );
	streams = await service._filterStreams( twitchStreams );
	assert.propEqual(
		streams.map( stream => stream.id ),
		[ 2, 5 ],
		"Return enabled streams and ignore vodcast settings"
	);

	set( settings, "notification.filter_vodcasts", true );

	set( settings, "notification.filter", true );
	streams = await service._filterStreams( twitchStreams );
	assert.propEqual(
		streams.map( stream => stream.id ),
		[ 1, 2 ],
		"Return unknown, enabled and live streams"
	);

	set( settings, "notification.filter", false );
	streams = await service._filterStreams( twitchStreams );
	assert.propEqual(
		streams.map( stream => stream.id ),
		[ 2 ],
		"Return enabled and live streams"
	);

});
