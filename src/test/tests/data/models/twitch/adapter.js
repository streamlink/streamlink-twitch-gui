import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import Service from "@ember/service";

import TwitchAdapter from "data/models/twitch/adapter";
import Stream from "data/models/twitch/stream/model";
import StreamAdapter from "data/models/twitch/stream/adapter";
import StreamSerializer from "data/models/twitch/stream/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import User from "data/models/twitch/user/model";
import UserAdapter from "data/models/twitch/user/adapter";
import UserSerializer from "data/models/twitch/user/serializer";
import TwitchAdapterFixtures from "fixtures/data/models/twitch/adapter.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/adapter", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-stream", Stream );
		owner.register( "adapter:twitch-stream", StreamAdapter );
		owner.register( "serializer:twitch-stream", StreamSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );
		owner.register( "model:twitch-user", User );
		owner.register( "adapter:twitch-user", UserAdapter );
		owner.register( "serializer:twitch-user", UserSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Coalesced single request with single type", assert => {

	let requests = 0;

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) => {
		++requests;

		return adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-stream-single" ],
			url,
			method,
			query
		);
	};

	return Promise.all([
		env.store.findRecord( "twitchStream", 2 ),
		env.store.findRecord( "twitchStream", 4 )
	])
		.then( () => {
			assert.ok(
				   env.store.hasRecordForId( "twitchStream", 2 )
				&& env.store.hasRecordForId( "twitchStream", 4 ),
				"Has all Stream records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", 2 )
				&& env.store.hasRecordForId( "twitchChannel", 4 ),
				"Has all Channel records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "stream/preview/2" )
				&& env.store.hasRecordForId( "twitchImage", "stream/preview/4" ),
				"Has all Image records registered in the data store"
			);
		})
		.then( () => {
			assert.strictEqual(
				requests,
				1,
				"Has made one request"
			);
		});

});


test( "Coalesced multiple requests with single type", assert => {

	const adapter = env.store.adapterFor( "twitchStream" );
	let requests = 0;

	// baseLength = 45 (space for two 10 char ids plus separator)
	adapter.maxURLLength = 66;
	adapter.ajax = ( url, method, query ) =>
		adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-stream-multiple" ][ requests++ ],
			url,
			method,
			query
		);

	const ids = [
		"1234567890",
		"1234567891",
		"1234567892",
		"1234567893"
	];

	return Promise.all(
		ids.map( id => env.store.findRecord( "twitchStream", id ) )
	)
		.then( () => {
			assert.strictEqual(
				requests,
				2,
				"Has made two requests"
			);
		});

});


test( "Coalesced single request with multiple types", assert => {

	let requests = 0;

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) => {
		++requests;

		return adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-various-single" ][ "stream" ],
			url,
			method,
			query
		);
	};

	env.store.adapterFor( "twitchUser" ).ajax = ( url, method, query ) => {
		++requests;

		return adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-various-single" ][ "user" ],
			url,
			method,
			query
		);
	};

	return Promise.all([
		env.store.findRecord( "twitchStream", 2 ),
		env.store.findRecord( "twitchStream", 4 ),
		env.store.findRecord( "twitchUser", "foo" ),
		env.store.findRecord( "twitchUser", "bar" )
	])
		.then( () => {
			assert.ok(
				   env.store.hasRecordForId( "twitchStream", 2 )
				&& env.store.hasRecordForId( "twitchStream", 4 ),
				"Has all Stream records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", 2 )
				&& env.store.hasRecordForId( "twitchChannel", 4 ),
				"Has all Channel records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "stream/preview/2" )
				&& env.store.hasRecordForId( "twitchImage", "stream/preview/4" ),
				"Has all Image records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchUser", "foo" )
				&& env.store.hasRecordForId( "twitchUser", "bar" ),
				"Has all Stream records registered in the data store"
			);
		})
		.then( () => {
			assert.strictEqual(
				requests,
				2,
				"Has made two requests"
			);
		});

});


test( "Coalesced multiple requests with multiple types", assert => {

	const streamAdapter = env.store.adapterFor( "twitchStream" );
	const userAdapter = env.store.adapterFor( "twitchUser" );
	let streamRequests = 0;
	let userRequests = 0;

	// baseLength = 45 (space for two 10 char ids plus separator)
	streamAdapter.maxURLLength = 66;
	streamAdapter.ajax = ( url, method, query ) =>
		adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-various-multiple" ][ "stream" ][ streamRequests++ ],
			url,
			method,
			query
		);

	const streamIds = [
		"1234567890",
		"1234567891",
		"1234567892",
		"1234567893"
	];

	// baseLength = 41 (space for two 3 char ids plus separator)
	userAdapter.maxURLLength = 48;
	userAdapter.ajax = ( url, method, query ) =>
		adapterRequest(
			assert,
			TwitchAdapterFixtures[ "coalesce-various-multiple" ][ "user" ][ userRequests++ ],
			url,
			method,
			query
		);

	const userIds = [
		"foo",
		"bar",
		"baz",
		"qux"
	];

	return Promise.all([
		...streamIds.map( id => env.store.findRecord( "twitchStream", id ) ),
		...userIds.map( id => env.store.findRecord( "twitchUser", id ) )
	])
		.then( () => {
			assert.deepEqual(
				env.store.peekAll( "twitchStream" ).mapBy( "id" ),
				streamIds,
				"Has all Stream records registered in the data store"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchChannel" ).mapBy( "id" ),
				streamIds,
				"Has all Channel records registered in the data store"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchImage" ).mapBy( "id" ),
				streamIds.map( id => `stream/preview/${id}` ),
				"Has all Image records registered in the data store"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchUser" ).mapBy( "id" ),
				userIds,
				"Has all Stream records registered in the data store"
			);
		})
		.then( () => {
			assert.strictEqual(
				streamRequests + userRequests,
				4,
				"Has made four requests"
			);
		});

});
