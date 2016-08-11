define(function( require ) {

	var config = {};

	config[ "main" ] = require( "root/config/main.json" );
	config[ "dirs" ] = require( "root/config/dirs.json" );
	config[ "files" ] = require( "root/config/files.json" );
	config[ "vars" ] = require( "root/config/vars.json" );
	config[ "update" ] = require( "root/config/update.json" );
	config[ "themes" ] = require( "root/config/themes.json" );
	config[ "langs" ] = require( "root/config/langs.json" );
	config[ "livestreamer" ] = require( "root/config/livestreamer.json" );
	config[ "twitch" ] = require( "root/config/twitch.json" );
	config[ "notification" ] = require( "root/config/notification.json" );
	config[ "chat" ] = require( "root/config/chat.json" );

	return config;

});
