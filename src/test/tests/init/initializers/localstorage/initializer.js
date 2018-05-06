import { module, test } from "qunit";
import sinon from "sinon";

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

	const getItemStub = sinon.stub();
	const setItemStub = sinon.stub();
	const namespacesSpy = sinon.spy();
	const settingsSpy = sinon.spy();
	const channelsettingsSpy = sinon.spy();

	getItemStub.throws( new Error( "Requests unexpected localstorage namespace" ) );
	getItemStub.withArgs( "settings" ).callsFake( () => JSON.stringify( settings ) );
	getItemStub.withArgs( "channelsettings" ).callsFake( () => JSON.stringify( channelsettings ) );

	setItemStub.throws( new Error( "Sets an unexpected localstorage namespace" ) );

	const LS = {
		getItem: getItemStub,
		setItem: setItemStub
	};

	const { default: { name, before, initialize } } = instanceInitializerInjector( {
		"./localstorage": LS,
		"./namespaces": namespacesSpy,
		"./settings": settingsSpy,
		"./channelsettings": channelsettingsSpy
	});

	assert.strictEqual( name, "localstorage", "Has a name" );
	assert.strictEqual( before, "ember-data", "Runs before ember-data" );
	assert.ok( initialize instanceof Function, "Has an initializer function" );

	initialize();

	assert.ok(
		namespacesSpy.calledWithExactly( LS ),
		"Updates namespace first"
	);
	assert.ok(
		getItemStub.getCall( 0 ).calledWith( "settings" ),
		"Gets settings"
	);
	assert.propEqual(
		settingsSpy.args,
		[ [ { foo: 1 } ] ],
		"Updates settings"
	);
	assert.ok(
		setItemStub.getCall( 0 ).calledWith( "settings", JSON.stringify( settings ) ),
		"Writes settings"
	);
	assert.ok(
		getItemStub.getCall( 1 ).calledWith( "channelsettings" ),
		"Gets channel settings"
	);
	assert.propEqual(
		channelsettingsSpy.args,
		[ [ { baz: 3 } ], [ { qux: 4 } ] ],
		"Updates each channel settings object"
	);
	assert.ok(
		setItemStub.getCall( 1 ).calledWith( "channelsettings", JSON.stringify( channelsettings ) ),
		"Writes channel settings"
	);

	assert.order([
		namespacesSpy.callIds[0],
		getItemStub.callIds[0],
		settingsSpy.callIds[0],
		setItemStub.callIds[0],
		getItemStub.callIds[1],
		channelsettingsSpy.callIds[0],
		channelsettingsSpy.callIds[1],
		setItemStub.callIds[1]
	], "Calls methods in correct order" );

});
