define(function( require ) {

	var config = {};

	config[ "main" ] = require( "json!root/config/main" );
	config[ "dirs" ] = require( "json!root/config/dirs" );
	config[ "files" ] = require( "json!root/config/files" );
	config[ "vars" ] = require( "json!root/config/vars" );
	config[ "update" ] = require( "json!root/config/update" );
	config[ "themes" ] = require( "json!root/config/themes" );
	config[ "langs" ] = require( "json!root/config/langs" );
	config[ "livestreamer" ] = require( "json!root/config/livestreamer" );
	config[ "twitch" ] = require( "json!root/config/twitch" );
	config[ "notification" ] = require( "json!root/config/notification" );
	config[ "chat" ] = require( "json!root/config/chat" );

	return config;

});
