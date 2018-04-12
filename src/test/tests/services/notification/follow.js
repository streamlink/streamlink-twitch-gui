import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import { set } from "@ember/object";
import Service from "@ember/service";
import RESTAdapter from "ember-data/adapters/rest";
import Model from "ember-data/model";
import RESTSerializer from "ember-data/serializers/rest";

import notificationFollowMixinInjector from "inject-loader?./cache!services/notification/follow";
import AdapterMixin from "data/models/-mixins/adapter";


let owner, env;


module( "services/notification/follow", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "model:twitch-channel-followed", Model.extend() );
		owner.register( "serializer:twitch-channel-followed", RESTSerializer.extend() );
		owner.register( "model:twitch-stream", Model.extend() );
		owner.register( "serializer:twitch-stream", RESTSerializer.extend() );

		env = setupStore( owner, { adapter: RESTAdapter.extend( AdapterMixin ) } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "UserHasFollowedChannel", async assert => {

	assert.expect( 4 );

	const stream = {};

	// create service
	const { default: NotificationFollowMixin } = notificationFollowMixinInjector({
		"./cache": {
			cacheAdd( obj ) {
				// will only be called once in this test
				assert.strictEqual( obj, stream, "Adds the returned stream to the cache" );
			}
		}
	});
	owner.register( "service:notification", Service.extend( NotificationFollowMixin ) );

	// create service instance
	const service = owner.lookup( "service:notification" );

	// don't actually make any requests
	env.adapter.ajax = async () => ({});

	let called = 0;
	env.store.findRecord = ( type, id, options ) => {
		// throw error on second call
		if ( ++called > 1 ) {
			throw new Error();
		}

		assert.strictEqual( type, "twitchStream", "Looks up the TwitchStream" );
		assert.strictEqual( id, "baz", "Looks for the correct stream id" );
		assert.propEqual( options, { reload: true }, "Always reloads existing records" );

		// return fake twitchStream record
		return stream;
	};

	// ignore non-twitchChannelFollowed
	await env.store.createRecord( "twitchStream", { id: "foo" } ).save();

	// do nothing while service is not running
	await env.store.createRecord( "twitchChannelFollowed", { id: "bar" } ).save();

	set( service, "running", true );

	// trigger createRecord
	await env.store.createRecord( "twitchChannelFollowed", { id: "baz" } ).save();

	// findRecord throws an error (stream offline)
	await env.store.createRecord( "twitchChannelFollowed", { id: "qux" } ).save();

});
