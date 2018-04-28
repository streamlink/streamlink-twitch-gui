import { module, test } from "qunit";

import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";


module( "data/models/settings/streams" );


test( "Default Vodcast RegExp", assert => {

	const re = new RegExp( DEFAULT_VODCAST_REGEXP, "i" );

	const shouldMatch = [
		"I'M NOT LIVE!!!",
		"RERUN: Title",
		"This is a re-run of yesterday's stream",
		"Restreaming yesterday's stream",
		"I'm just re-streaming",
		"vodcast",
		"vod-cast",
		"vodcasting",
		"vod-casting",
		"rebroadcast",
		"re-broadcast",
		"rebroadcasting",
		"re-broadcasting"
	];

	const shouldNotMatch = [
		"rerunning",
		"re-running",
		"restream",
		"re-stream",
		"This broadcast is presented by",
		"Fear not. Live your life!"
	];

	assert.ok(
		shouldMatch.every( str => re.test( str ) ),
		"All strings expected to match match"
	);
	assert.ok(
		!shouldNotMatch.some( str => re.test( str ) ),
		"All strings expected not to match don't match"
	);

});

