import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import { setupStore } from "store-utils";
import { get } from "@ember/object";
import Game from "models/twitch/Game";
import GameSerializer from "models/twitch/GameSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchGameFixtures from "fixtures/models/twitch/Game.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/Game", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "model:twitch-game", Game );
		owner.register( "serializer:twitch-game", GameSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Serializer", assert => {

	// TwitchGame is just an embedded model
	// ignore the queried record id

	env.adapter.queryRecord = () =>
		Promise.resolve({
			twitchGame: TwitchGameFixtures[ "embedded" ]
		});

	return env.store.queryRecord( "twitchGame", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "some game",
					name: "some game",
					box: "game/box/some game",
					logo: "game/logo/some game"
				},
				"Has the correct model id and attributes"
			);

			assert.deepEqual(
				get( record, "box" ).toJSON({ includeId: true }),
				{
					id: "game/box/some game",
					image_large: "box-large.jpg",
					image_medium: "box-medium.jpg",
					image_small: "box-small.jpg"
				},
				"The box relation has the correct attributes"
			);

			assert.deepEqual(
				get( record, "logo" ).toJSON({ includeId: true }),
				{
					id: "game/logo/some game",
					image_large: "logo-large.jpg",
					image_medium: "logo-medium.jpg",
					image_small: "logo-small.jpg"
				},
				"The logo relation has the correct attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchImage", "game/box/some game" ),
				"Store has a TwitchImage record of the the box image"
			);
			assert.ok(
				env.store.hasRecordForId( "twitchImage", "game/logo/some game" ),
				"Store has a TwitchImage record of the the logo image"
			);
		});

});
