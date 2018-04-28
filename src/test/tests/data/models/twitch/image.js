import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import { get } from "@ember/object";

import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchImageFixtures from "fixtures/data/models/twitch/image.json";


const dateNow = Date.now;

const TwitchImage = imageInjector({
	config: {
		vars: {
			"image-expiration-time": 1000
		}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/image", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer.extend({
			modelNameFromPayloadKey() {
				return "twitchImage";
			}
		}) );

		env = setupStore( owner );
	},

	afterEach() {
		Date.now = dateNow;

		runDestroy( owner );
		owner = env = null;
	}
});


test( "Serializer", assert => {

	// TwitchImage is just an embedded model

	env.adapter.findRecord = () =>
		Promise.resolve({
			twitchImage: TwitchImageFixtures[ "embedded" ]
		});

	return env.store.findRecord( "twitchImage", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON(),
				{
					image_large: "large.jpg",
					image_medium: "medium.jpg",
					image_small: "small.jpg"
				},
				"Has the correct model attributes"
			);
		});

});


test( "Computed properties: largeLatest, mediumLatest and smallLatest", assert => {

	const record = env.store.createRecord( "twitchImage", {
		image_large: "large.jpg",
		image_medium: "medium.jpg",
		image_small: "small.jpg"
	});

	[ "large", "medium", "small" ].forEach( prop => {
		// initial state
		assert.strictEqual(
			get( record, `expiration_${prop}` ),
			null,
			"Does not have an expiration time property initially"
		);

		// access the [...]Latest property
		Date.now = () => 0;
		assert.strictEqual(
			get( record, `${prop}Latest` ),
			`${prop}.jpg?_=1000`,
			"Uses the correct initial query string"
		);
		assert.strictEqual(
			get( record, `expiration_${prop}` ),
			1000,
			"Has an expiration time property"
		);

		// expiration time is almost reached
		Date.now = () => 999;
		assert.strictEqual(
			get( record, `${prop}Latest` ),
			`${prop}.jpg?_=1000`,
			"Still uses the same query string when expiration time hasn't been reached yet"
		);

		// expiration time has been reached
		Date.now = () => 1000;
		assert.strictEqual(
			get( record, `${prop}Latest` ),
			`${prop}.jpg?_=2000`,
			"Uses the a new query string when expiration time has been reached"
		);
		assert.strictEqual(
			get( record, `expiration_${prop}` ),
			2000,
			"The expiration time property has been updated"
		);
	});

});


test( "Computed properties: large, medium and small", assert => {

	const record = env.store.createRecord( "twitchImage", {
		image_large: "large.jpg",
		image_medium: "medium.jpg",
		image_small: "small.jpg"
	});

	[ "large", "medium", "small" ].forEach( prop => {
		// access the [...] property
		Date.now = () => 0;
		assert.strictEqual(
			get( record, prop ),
			`${prop}.jpg?_=1000`,
			"Uses the correct initial query string"
		);
		assert.strictEqual(
			get( record, `expiration_${prop}` ),
			1000,
			"Has an expiration time property"
		);

		// expiration time been has reached
		Date.now = () => 10000;
		assert.strictEqual(
			get( record, prop ),
			`${prop}.jpg?_=1000`,
			"Still uses the same query string when expiration time has been reached"
		);

		// [...]Latest gets accessed again
		get( record, `${prop}Latest`);
		assert.strictEqual(
			get( record, prop ),
			`${prop}.jpg?_=11000`,
			"Uses the new query string of the last Latest access"
		);
	});

});
