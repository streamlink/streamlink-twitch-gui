import Ember from "Ember";
import config from "config";
import openBrowser from "nwjs/openBrowser";
import Parameter from "utils/Parameter";
import ParameterCustom from "utils/ParameterCustom";
import Substitution from "utils/Substitution";
import whichFallback from "utils/node/fs/whichFallback";
import stat from "utils/node/fs/stat";
import CP from "child_process";
import PATH from "path";


	var get = Ember.get;
	var run = Ember.run;

	var twitchChatUrl = config.twitch[ "chat-url" ];
	var chatApplications = config.chat;


	function launch( exec, params ) {
		return new Promise(function( resolve, reject ) {
			var spawn = CP.spawn( exec, params, {
				detached: true,
				stdio: "ignore"
			});
			spawn.unref();
			spawn.on( "error", reject );
			run.next( resolve );
		});
	}


	export default Ember.Service.extend({
		settings: Ember.inject.service(),
		auth: Ember.inject.service(),


		/**
		 * @param channel
		 * @returns {Promise}
		 */
		open: function( channel ) {
			var url  = twitchChatUrl;
			var name = get( channel, "id" );

			if ( !url || !name ) {
				return Promise.reject( new Error( "Missing URL or channel name" ) );
			}

			url = url.replace( "{channel}", name );

			var method   = get( this, "settings.chat_method" );
			var command  = get( this, "settings.chat_command" ).trim();

			switch ( method ) {
				case "default":
				case "browser":
					return this._openDefaultBrowser( url );
				case "irc":
					return this._openIRC( channel );
				case "chromium":
				case "chrome":
					return this._openPredefined( command, method, url );
				case "msie":
					return this._openMSIE( url );
				case "chatty":
					return this._openChatty( command, name );
				case "custom":
					return this._openCustom( command, name, url );
				default:
					return Promise.reject( new Error( "Invalid chat method" ) );
			}
		},


		_openDefaultBrowser: function( url ) {
			return new Promise(function( resolve ) {
				openBrowser( url );
				run.next( resolve );
			});
		},


		_openIRC: function() {
			return Promise.reject( new Error( "Not yet implemented" ) );
		},


		_openPredefined: function( command, key, url ) {
			var data = chatApplications[ key ];
			if ( !data ) { return Promise.reject( new Error( "Missing chat data" ) ); }

			var args     = data[ "args" ];
			var exec     = data[ "exec" ];
			var fallback = data[ "fallback" ];

			var context = {
				args: args,
				url : url
			};
			var paramsPredefined = [
				new ParameterCustom( null, "args", [
					new Substitution( "url", "url" )
				])
			];

			var promise = command.length
				// user has set a custom executable path
				? whichFallback( command )
				// no custom command
				: whichFallback( exec, fallback );

			return promise
				.then(function( exec ) {
					var params = Parameter.getParameters( context, paramsPredefined, true );
					return launch( exec, params );
				});
		},


		_openMSIE: function( url ) {
			var data = chatApplications[ "msie" ];
			if ( !data ) { return Promise.reject( new Error( "Missing chat data" ) ); }

			var args   = data[ "args" ];
			var exec   = data[ "exec" ];
			var script = data[ "script" ];

			// the script needs to be inside the application's folder
			var dir    = PATH.dirname( process.execPath );
			var file   = PATH.join( dir, script );

			var context = {
				args  : args,
				url   : url,
				script: file
			};
			var paramsMSIE = [
				new ParameterCustom( null, "args", [
					new Substitution( "url", "url" ),
					new Substitution( "script", "script" )
				])
			];

			return stat( file )
				.then(function() {
					var params = Parameter.getParameters( context, paramsMSIE, true );
					return launch( exec, params );
				});
		},


		_openChatty: function( chatty, channel ) {
			var data = chatApplications[ "chatty" ];
			if ( !data ) { return Promise.reject( new Error( "Missing chat data" ) ); }

			var isLoggedIn = get( this, "auth.session.isLoggedIn" );
			var token      = get( this, "auth.session.access_token" );
			var user       = get( this, "auth.session.user_name" );
			var javaArgs   = data[ "args" ];
			var javaExec   = data[ "exec" ];
			var javaFb     = data[ "fallback" ];
			var chattyFb   = data[ "chatty-fallback" ];

			// object containing all the required data
			var context = {
				args   : isLoggedIn
					? data[ "chatty-args" ]
					: data[ "chatty-args-noauth" ],
				chatty : chatty,
				user   : user,
				token  : token,
				channel: channel
			};

			// custom parameter substitutions
			var substitutions = [
				new Substitution( "channel", "channel" )
			];

			if ( isLoggedIn ) {
				substitutions.push(
					new Substitution( "user", "user" ),
					new Substitution( "token", "token" )
				);
			}

			// just a single custom parameter, so a string can be defined in package.json
			var paramsChatty = [
				new ParameterCustom( null, "args", substitutions )
			];

			var promise = !chatty || !chatty.trim().length
				// look for a chatty startscript if no chatty jar file has been set
				? whichFallback( chattyFb )
				// validate java installation
				: whichFallback( javaExec, javaFb )
					.then(function( exec ) {
						// check for existing chatty .jar file (and return java executable)
						return stat( chatty )
							.then(function() {
								// alter command line
								context.args = javaArgs + " " + context.args;
								substitutions.push( new Substitution( "chatty", "chatty" ) );
								return exec;
							});
					});

			return promise
				.then(function( exec ) {
					var params = Parameter.getParameters( context, paramsChatty, true );
					return launch( exec, params );
				});
		},


		substitutionsCustom: [
			new Substitution( "url", "url", "Twitch chat URL" ),
			new Substitution( "user", "user", "User name" ),
			new Substitution( "channel", "channel", "Channel name" ),
			new Substitution( "token", "token", "Twitch access token" )
		],

		_openCustom: function( command, channel, url ) {
			var context = {
				command: command,
				channel: channel,
				url    : url,
				user   : get( this, "auth.session.user_name" ),
				token  : get( this, "auth.session.access_token" )
			};
			var substitutionsCustom = get( this, "substitutionsCustom" );
			var paramsCustom = [
				new ParameterCustom( null, "command", substitutionsCustom )
			];

			var params = Parameter.getParameters( context, paramsCustom, true );
			var exec   = params.shift();

			return whichFallback( exec )
				.then(function() {
					return launch( exec, params );
				});
		}
	});
