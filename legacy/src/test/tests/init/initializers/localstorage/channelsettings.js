import { module, test } from "qunit";

import updateChannelSettingsInjector
	from "inject-loader?-./utils!init/initializers/localstorage/channelsettings";


module( "init/initializers/localstorage/channelsettings" );


test( "ChannelSettings", assert => {

	const { default: updateChannelSettings } = updateChannelSettingsInjector({
		"data/models/stream/model": {
			qualities: [
				{ id: "foo" },
				{ id: "bar" }
			]
		}
	});

	const oldAttrs = {
		quality: null,
		gui_openchat: true,
		notify_enabled: false
	};
	updateChannelSettings( oldAttrs );
	assert.propEqual(
		oldAttrs,
		{
			streaming_quality: null,
			streams_chat_open: true,
			notification_enabled: false
		},
		"Renames old attributes"
	);

	const newAttrs = {
		streaming_quality: null,
		streams_chat_open: true,
		notification_enabled: false
	};
	updateChannelSettings( newAttrs );
	assert.propEqual(
		newAttrs,
		{
			streaming_quality: null,
			streams_chat_open: true,
			notification_enabled: false
		},
		"Doesn't change new attributes"
	);

	const emptyAttrs = {};
	updateChannelSettings( emptyAttrs );
	assert.propEqual( emptyAttrs, {}, "Does nothing with empty objects" );

	const qualityNull = { quality: null };
	updateChannelSettings( qualityNull );
	assert.propEqual(
		qualityNull,
		{ streaming_quality: null },
		"Doesn't change null value quality"
	);

	const qualityIndexFirst = { quality: 0 };
	updateChannelSettings( qualityIndexFirst );
	assert.propEqual(
		qualityIndexFirst,
		{ streaming_quality: "foo" },
		"Sets the correct quality id by index"
	);

	const qualityIndexSecond = { quality: 1 };
	updateChannelSettings( qualityIndexSecond );
	assert.propEqual(
		qualityIndexSecond,
		{ streaming_quality: "bar" },
		"Sets the correct quality id by index"
	);

	const qualityName = { quality: "foo" };
	updateChannelSettings( qualityName );
	assert.propEqual(
		qualityName,
		{ streaming_quality: "foo" },
		"Doesn't change the quality if it's already correct"
	);

});
