import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import {
	setupStore,
	adapterRequest
} from "store-utils";
import {
	get,
	set,
	run,
	Service
} from "ember";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchChannelFixtures from "fixtures/models/twitch/Channel.json";


let owner, env;


module( "models/twitch/Channel", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], url, method, query );

	return env.store.findRecord( "twitchChannel", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					broadcaster_language: "en",
					created_at: "2000-01-01T00:00:00.000Z",
					display_name: "Foo",
					followers: 1337,
					game: "some game",
					language: "en",
					logo: "logo",
					mature: false,
					name: "foo",
					partner: false,
					profile_banner: null,
					profile_banner_background_color: null,
					status: "Playing some game",
					updated_at: "2000-01-01T00:00:01.000Z",
					url: "https://www.twitch.tv/foo",
					video_banner: null,
					views: 13337
				},
				"Has all the attributes"
			);
		});

});


test( "Computed properties", assert => {

	const record = env.store.createRecord( "twitchChannel", {
		name: "foo",
		display_name: "foo"
	});


	// hasCustomDisplayName

	assert.strictEqual(
		get( record, "hasCustomDisplayName" ),
		false,
		"Does not have a custom display name when name and display_name are equal"
	);

	run( () => set( record, "display_name", "Foo" ) );
	assert.strictEqual(
		get( record, "hasCustomDisplayName" ),
		false,
		"Does not have a custom display name when capitalization of name and display_name differs"
	);

	run( () => set( record, "display_name", "bar" ) );
	assert.strictEqual(
		get( record, "hasCustomDisplayName" ),
		true,
		"Does have a custom display name name and display_name differ"
	);


	// detailedName

	const settings = owner.lookup( "service:settings" );

	run( () => set( settings, "content", { channel_name: 1 } ) );
	assert.strictEqual(
		get( record, "detailedName" ),
		"bar",
		"Only shows the channel name when settings.channel_name is 1"
	);

	run( () => set( settings, "content.channel_name", 2 ) );
	assert.strictEqual(
		get( record, "detailedName" ),
		"foo",
		"Only shows the channel display_name when settings.channel_name is 2"
	);

	run( () => set( settings, "content.channel_name", 3 ) );
	assert.strictEqual(
		get( record, "detailedName" ),
		"bar (foo)",
		"Shows both names when settings.channel_name is 3 and hasCustomDisplayName is true"
	);

	run( () => set( record, "display_name", "foo" ) );
	assert.strictEqual(
		get( record, "detailedName" ),
		"foo",
		"Shows display_name when settings.channel_name is 3 and hasCustomDisplayName is false"
	);


	// titleFollowers

	run( () => set( record, "followers", 1 ) );
	assert.strictEqual(
		get( record, "titleFollowers" ),
		"1 person is following",
		"Shows the correct title when one person is following"
	);

	run( () => set( record, "followers", 2 ) );
	assert.strictEqual(
		get( record, "titleFollowers" ),
		"2 people are following",
		"Shows the correct title when more people are following"
	);


	// titleViews

	run( () => set( record, "views", 1 ) );
	assert.strictEqual(
		get( record, "titleViews" ),
		"1 channel view",
		"Shows the correct title when channel has one view"
	);

	run( () => set( record, "views", 2 ) );
	assert.strictEqual(
		get( record, "titleViews" ),
		"2 channel views",
		"Shows the correct title when channel has more views"
	);


	// hasLanguage

	assert.strictEqual(
		get( record, "hasLanguage" ),
		false,
		"Does not have a language when attribute is missing"
	);

	run( () => set( record, "language", "other" ) );
	assert.strictEqual(
		get( record, "hasLanguage" ),
		false,
		"Does not have a language when the value of the language attribute is 'other'"
	);

	run( () => set( record, "language", "en" ) );
	assert.strictEqual(
		get( record, "hasLanguage" ),
		true,
		"Does have a language when the value of the language attribute is not 'other'"
	);


	// hasBroadcasterLanguage

	assert.strictEqual(
		get( record, "hasBroadcasterLanguage" ),
		false,
		"Does not have a broadcaster language when attribute is missing"
	);

	run( () => set( record, "broadcaster_language", "en" ) );
	assert.strictEqual(
		get( record, "hasBroadcasterLanguage" ),
		false,
		"Does not have a broadcaster language when both attributes are equal"
	);

	run( () => set( record, "broadcaster_language", "en-gb" ) );
	assert.strictEqual(
		get( record, "hasBroadcasterLanguage" ),
		false,
		"Does not have a broadcaster language when both main languages are equal"
	);

	run( () => set( record, "language", "en-us" ) );
	assert.strictEqual(
		get( record, "hasBroadcasterLanguage" ),
		false,
		"Does not have a broadcaster language when both main languages are equal"
	);

	run( () => set( record, "broadcaster_language", "de" ) );
	assert.strictEqual(
		get( record, "hasBroadcasterLanguage" ),
		true,
		"Does have a broadcaster language when both languages differ"
	);

});
