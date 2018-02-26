import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import ChannelPanel from "models/twitch/ChannelPanel";
import ChannelPanelAdapter from "models/twitch/ChannelPanelAdapter";
import ChannelPanelSerializer from "models/twitch/ChannelPanelSerializer";
import TwitchChannelPanelFixtures from "fixtures/models/twitch/ChannelPanel.json";


let owner, env;


module( "models/twitch/ChannelPanel", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-channel-panel", ChannelPanel );
		owner.register( "adapter:twitch-channel-panel", ChannelPanelAdapter );
		owner.register( "serializer:twitch-channel-panel", ChannelPanelSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.store.adapterFor( "twitchChannelPanel" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelPanelFixtures, url, method, query );

	return env.store.query( "twitchChannelPanel", { channel: "foo" } )
		.then( records => {
			assert.strictEqual(
				get( records, "length" ),
				2,
				"Returns all records"
			);

			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "1",
						display_order: 1,
						kind: "default",
						html_description: "description-html-1",
						link: "url-1",
						image: "image-1",
						title: "title-1"
					},
					{
						id: "2",
						display_order: 2,
						kind: "default",
						html_description: null,
						link: "url-2",
						image: "image-2",
						title: ""
					}
				],
				"Records have the correct id and attributes"
			);
		});

});
