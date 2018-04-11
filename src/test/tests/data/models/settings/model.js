import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import { get, set } from "@ember/object";
import { sendEvent } from "@ember/object/events";
import { run } from "@ember/runloop";
import attr from "ember-data/attr";
import { fragment } from "ember-data-model-fragments/attributes";
import Fragment from "ember-data-model-fragments/fragment";
import ModelFragmentsInitializer from "init/initializers/model-fragments";

import Settings from "data/models/settings/model";


module( "data/models/settings", {
	beforeEach() {
		const owner = this.owner = buildOwner();

		ModelFragmentsInitializer.initialize( owner );

		owner.register( "model:settings", Settings );
		owner.register( "model:settings-gui", Fragment.extend() );
		owner.register( "model:settings-streaming", Fragment.extend() );
		owner.register( "model:settings-streams", Fragment.extend({
			languages: fragment( "settings-streams-languages", { defaultValue: {} } )
		}) );
		owner.register( "model:settings-streams-languages", Fragment.extend({
			de: attr( "boolean", { defaultValue: false } ),
			en: attr( "boolean", { defaultValue: false } ),
			fr: attr( "boolean", { defaultValue: false } )
		}) );
		owner.register( "model:settings-chat", Fragment.extend() );
		owner.register( "model:settings-notification", Fragment.extend() );

		this.env = setupStore( this.owner );
	},

	afterEach() {
		runDestroy( this.owner );
	}
});


test( "Serializer", function( assert ) {

	const settings = this.env.store.createRecord( "settings", {
		id: 1
	});

	assert.deepEqual(
		settings.toJSON(),
		{
			advanced: false,
			gui: {},
			streaming: {},
			streams: {
				languages: {
					de: false,
					en: false,
					fr: false
				}
			},
			chat: {},
			notification: {}
		},
		"Settings serialize correctly"
	);

});


test( "hasStreamsLanguagesSelection on didUpdate", function( assert ) {

	const settings = this.env.store.createRecord( "settings", { id: 1 } );

	assert.notOk(
		get( settings, "hasStreamsLanguagesSelection" ),
		"Doesn't have a custom language selection"
	);

	set( settings, "streams.languages.de", true );
	sendEvent( settings, "didUpdate" );

	assert.ok(
		get( settings, "hasStreamsLanguagesSelection" ),
		"Does have a custom language selection now"
	);

	set( settings, "streams.languages.en", true );
	sendEvent( settings, "didUpdate" );

	assert.ok(
		get( settings, "hasStreamsLanguagesSelection" ),
		"Does still have a custom language selection"
	);

	set( settings, "streams.languages.fr", true );
	sendEvent( settings, "didUpdate" );

	assert.notOk(
		get( settings, "hasStreamsLanguagesSelection" ),
		"Doesn't have a custom language selection anymore"
	);

	const settingsTwo = run( () => this.env.store.createRecord( "settings", {
		id: 2,
		streams: {
			languages: {
				de: false,
				en: true,
				fr: false
			}
		}
	}) );

	assert.ok(
		get( settingsTwo, "hasStreamsLanguagesSelection" ),
		"Finds initial custom language selection"
	);

});
