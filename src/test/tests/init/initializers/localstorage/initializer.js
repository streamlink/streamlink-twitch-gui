import { module, test } from "qunit";

import instanceInitializerInjector from "inject-loader!init/initializers/localstorage/initializer";


module( "init/initializers/localstorage/initializer" );


test( "Application instance initializer", assert => {

	const settings = {
		settings: {
			records: {
				1: { foo: 1 },
				2: { bar: 2 }
			}
		}
	};

	const channelsettings = {
		"channel-settings": {
			records: {
				1: { baz: 3 },
				2: { qux: 4 }
			}
		}
	};

	const LS = {
		getItem( item ) {
			assert.step( "getItem" );
			assert.step( item );
			if ( item === "settings" ) {
				return JSON.stringify( settings );
			} else if ( item === "channelsettings" ) {
				return JSON.stringify( channelsettings );
			} else {
				assert.ok( false, "Requests unexpected localstorage namespace" );
			}
		},
		setItem( item, string ) {
			assert.step( "setItem" );
			assert.step( item );
			if ( item === "settings" ) {
				assert.strictEqual( string, JSON.stringify( settings ), "Sets settings data" );
			} else if ( item === "channelsettings" ) {
				assert.strictEqual(
					string,
					JSON.stringify( channelsettings ),
					"Sets channel settings data"
				);
			} else {
				assert.ok( false, "Sets an unexpected localstorage namespace" );
			}
		}
	};

	const expectedChannelSettings = [ { baz: 3 }, { qux: 4 } ];

	const { default: { name, before, initialize } } = instanceInitializerInjector({
		"./localstorage": LS,
		"./namespaces": ls => {
			assert.step( "updateNamespaces" );
			assert.strictEqual( ls, LS );
		},
		"./settings": settings => {
			assert.step( "updateSettings" );
			assert.propEqual( settings, { foo: 1 }, "Uses correct settings object" );
		},
		"./channelsettings": channelsettings => {
			assert.step( "updateChannelSettings" );
			assert.propEqual(
				channelsettings,
				expectedChannelSettings.shift(),
				"Uses correct channel settings object"
			);
		}
	});

	assert.strictEqual( name, "localstorage", "Has a name" );
	assert.strictEqual( before, "ember-data", "Runs before ember-data" );
	assert.ok( initialize instanceof Function, "Has an initializer function" );
	initialize();

	assert.checkSteps([
		"updateNamespaces",
		"getItem",
		"settings",
		"updateSettings",
		"setItem",
		"settings",
		"getItem",
		"channelsettings",
		"updateChannelSettings",
		"updateChannelSettings",
		"setItem",
		"channelsettings"
	], "Executes everything in the correct order" );

});
