import {
	module,
	test
} from "qunit";
import updateChannelSettingsInjector
	from "inject-loader?-./utils!initializers/localstorage/channelsettings";


module( "initializers/localstorage/channelsettings" );


test( "ChannelSettings", assert => {

	const { default: updateChannelSettings } = updateChannelSettingsInjector({
		"models/stream/qualities": [
			{ id: "foo" },
			{ id: "bar" }
		]
	});

	const a = {};
	updateChannelSettings( a );
	assert.propEqual( a, {}, "Does nothing on empty objects" );

	const b = { quality: null };
	updateChannelSettings( b );
	assert.propEqual( b, { quality: "foo" }, "Uses first available quality if it is unknown" );

	const c = { quality: 0 };
	updateChannelSettings( c );
	assert.propEqual( c, { quality: "foo" }, "Sets the correct quality id by index" );

	const d = { quality: 1 };
	updateChannelSettings( d );
	assert.propEqual( d, { quality: "bar" }, "Sets the correct quality id by index" );

});
