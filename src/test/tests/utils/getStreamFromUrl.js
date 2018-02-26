import { module, test } from "qunit";

import getStreamFromUrl from "utils/getStreamFromUrl";


module( "utils/getStreamFromUrl" );


test( "Invalid URLs", function( assert ) {

	// non-URLs
	assert.equal( getStreamFromUrl( "" ), false );
	assert.equal( getStreamFromUrl( "foo" ), false );

	// subdomains, https and missing channel
	assert.equal( getStreamFromUrl( "twitch.tv" ), false );
	assert.equal( getStreamFromUrl( "www.twitch.tv" ), false );
	assert.equal( getStreamFromUrl( "secure.twitch.tv" ), false );
	assert.equal( getStreamFromUrl( "foo.twitch.tv/name" ), false );
	assert.equal( getStreamFromUrl( "http://www.twitch.tv" ), false );
	assert.equal( getStreamFromUrl( "http://www.twitch.tv/" ), false );
	assert.equal( getStreamFromUrl( "https://www.twitch.tv" ), false );

	// nested routes
	assert.equal( getStreamFromUrl( "www.twitch.tv/p/about" ), false );

	// blacklisted routes
	assert.equal( getStreamFromUrl( "www.twitch.tv/login" ), false );
	assert.equal( getStreamFromUrl( "www.twitch.tv/signup" ), false );
	assert.equal( getStreamFromUrl( "www.twitch.tv/logout" ), false );
	assert.equal( getStreamFromUrl( "www.twitch.tv/settings" ), false );
	assert.equal( getStreamFromUrl( "www.twitch.tv/directory" ), false );

});


test( "Valid URLs", function( assert ) {

	assert.equal( getStreamFromUrl( "twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "www.twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "secure.twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "go.twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "http://twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "https://twitch.tv/name" ), "name" );
	assert.equal( getStreamFromUrl( "twitch.tv/name/profile" ), "name" );

});
