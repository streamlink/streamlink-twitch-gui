import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";

import { set } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";

import Settings from "data/models/settings/model";
import settingsStreamsLanguagesInjector
	from "inject-loader?config!data/models/settings/streams/languages/fragment";
import ModelFragmentsInitializer from "init/initializers/model-fragments";


module( "data/models/settings", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			Settings,
			SettingsGui: Fragment.extend(),
			SettingsHotkeys: Fragment.extend(),
			SettingsStreaming: Fragment.extend(),
			SettingsStreams: Fragment.extend({
				languages: fragment( "settings-streams-languages", { defaultValue: {} } )
			}),
			SettingsChat: Fragment.extend(),
			SettingsNotification: Fragment.extend()
		})
	});

	hooks.beforeEach(function() {
		const { default: SettingsStreamsLanguages } = settingsStreamsLanguagesInjector({
			config: {
				langs: {
					de: { disabled: false },
					en: { disabled: false },
					fr: { disabled: true }
				}
			}
		});
		this.owner.register( "model:settings-streams-languages", SettingsStreamsLanguages );
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
				streams: {
					languages: {
						de: false,
						en: false
					}
				},
				chat: {},
				notification: {}
			},
			"Settings serialize correctly"
		);
	});

	test( "Language selection", function( assert ) {
		const store = this.owner.lookup( "service:store" );
		const settings = store.createRecord( "settings", {
			id: 1,
			streams: {
				languages: {
					de: false,
					en: true
				}
			}
		});

		assert.ok( settings.hasAnyStreamsLanguagesSelection, "Has a language selection" );

		set( settings, "streams.languages.en", false );
		settings.trigger( "didUpdate" );
		assert.notOk( settings.hasAnyStreamsLanguagesSelection, "Has no language selections" );

		set( settings, "streams.languages.de", true );
		settings.trigger( "didUpdate" );
		assert.ok( settings.hasAnyStreamsLanguagesSelection, "Has a language selection" );
	});
});
