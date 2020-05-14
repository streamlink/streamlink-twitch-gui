import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";

import Fragment from "ember-data-model-fragments/fragment";

import Settings from "data/models/settings/model";
import ModelFragmentsInitializer from "init/initializers/model-fragments";


module( "data/models/settings", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			Settings,
			SettingsGui: Fragment.extend(),
			SettingsHotkeys: Fragment.extend(),
			SettingsStreaming: Fragment.extend(),
			SettingsStreams: Fragment.extend(),
			SettingsChat: Fragment.extend(),
			SettingsNotification: Fragment.extend()
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );

		ModelFragmentsInitializer.initialize( this.owner );
	});


	test( "Serializer", function( assert ) {
		const store = this.owner.lookup( "service:store" );
		const settings = store.createRecord( "settings", {
			id: 1
		});

		assert.propEqual(
			settings.toJSON(),
			{
				advanced: false,
				gui: {},
				hotkeys: {},
				streaming: {},
				streams: {},
				chat: {},
				notification: {}
			},
			"Settings serialize correctly"
		);
	});
});
