import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";

import Adapter from "ember-data/adapter";
import Model from "ember-data/model";
import { fragment } from "ember-data-model-fragments/attributes";

import ModelFragmentsInitializer from "init/initializers/model-fragments";
import SettingsHotkeysNamespaceInitializer from "init/initializers/settings-hotkeys-namespace";
import SettingsSerializer from "data/models/settings/serializer";
import SettingsHotkeys from "data/models/settings/hotkeys/fragment";
import { default as SettingsHotkeysNamespace, typeKey }
	from "data/models/settings/hotkeys/namespace/fragment";
import SettingsHotkeysNamespaceSerializer from "data/models/settings/hotkeys/namespace/serializer";
import SettingsHotkeysAction from "data/models/settings/hotkeys/action/fragment";
import SettingsHotkeysHotkey from "data/models/settings/hotkeys/hotkey/fragment";
import { hotkeys as configHotkeys } from "config";


module( "data/models/settings/hotkeys", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			Settings: Model.extend({
				hotkeys: fragment( "settings-hotkeys", { defaultValue: {} } )
			}),
			SettingsAdapter: Adapter.extend(),
			SettingsSerializer,
			SettingsHotkeys,
			SettingsHotkeysNamespace,
			SettingsHotkeysNamespaceSerializer,
			SettingsHotkeysAction,
			SettingsHotkeysHotkey
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );

		ModelFragmentsInitializer.initialize( this.owner );
		SettingsHotkeysNamespaceInitializer.initialize( this.owner );
	});


	test( "Serializer", async function( assert) {
		const store = this.owner.lookup( "service:store" );
		const settings = store.createRecord( "settings", { id: 1 } );

		const empty = {
			disabled: false,
			code: null,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false
		};

		const hotkeys = {};
		for ( const [ namespaceName, { actions } ] of Object.entries( configHotkeys ) ) {
			const namespace = {};
			for ( const [ action, data ] of Object.entries( actions ) ) {
				if ( typeof data === "string" ) { continue; }
				namespace[ action ] = {
					primary: Object.assign( {}, empty ),
					secondary: Object.assign( {}, empty )
				};
			}
			if ( !Object.keys( namespace ).length ) { continue; }
			namespace[ typeKey ] = `settings-hotkeys-namespace-${namespaceName}`;
			hotkeys[ namespaceName ] = namespace;
		}

		assert.propEqual(
			settings.serialize(),
			{ hotkeys },
			"Properly serializes hotkeys fragment and creates fragments of all default hotkeys"
		);
	});
});
