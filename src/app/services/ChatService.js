define([
	"Ember",
	"nwjs/nwGui",
	"utils/Parameter",
	"utils/ParameterCustom",
	"utils/Substitution",
	"utils/resolvePath",
	"utils/fs/which",
	"utils/fs/stat"
], function(
	Ember,
	nwGui,
	Parameter,
	ParameterCustom,
	Substitution,
	resolvePath,
	which,
	stat
) {

	var CP   = require( "child_process" );
	var PATH = require( "path" );

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;
	var run = Ember.run;

	var platform = process.platform;
	var isWin = platform === "win32";

	function checkExec( stat ) {
		return stat.isFile() && ( isWin || ( stat.mode & 73 ) > 0 );
	}

	function launch( exec, params ) {
		return new Promise(function( resolve, reject ) {
			var spawn = CP.spawn( exec, params, { detached: true } );
			spawn.on( "error", reject );
			run.next( resolve );
		});
	}


	return Ember.Service.extend({
		metadata: Ember.inject.service(),
		settings: Ember.inject.service(),

		chatMethods: readOnly( "metadata.config.chat-methods" ),

		/**
		 * @param channel
		 * @returns {Promise}
		 */
		open: function( channel ) {
			var url  = get( this, "metadata.config.twitch-chat-url" );
			var name = get( channel, "id" );

			if ( !url || !name ) {
				return Promise.reject( new Error( "Missing URL or channel name" ) );
			}

			url = url.replace( "{channel}", name );

			var advanced = get( this, "settings.advanced" );
			var method   = get( this, "settings.chat_method" );
			var command  = get( this, "settings.chat_command" ).trim();

			if ( !advanced ) {
				method = "default";
			}

			switch ( method ) {
				case "default":
				case "browser":
					return this._openDefaultBrowser( url );
				case "irc":
					return this._openIRC( channel );
				case "chromium":
				case "chrome":
				case "firefox":
					return this._openPredefined( command, method, url );
				case "msie":
					return this._openMSIE( url );
				case "custom":
					return this._openCustom( command, name, url );
				default:
					return Promise.reject( new Error( "Invalid chat method" ) );
			}
		},


		_openDefaultBrowser: function( url ) {
			return new Promise(function( resolve ) {
				nwGui.Shell.openExternal( url );
				run.next( resolve );
			});
		},


		_openIRC: function() {
			return Promise.reject( new Error( "Not yet implemented" ) );
		},


		_openPredefined: function( command, key, url ) {
			var methods  = get( this, "chatMethods" );
			var data     = methods[ key ];
			var args     = data[ "args" ];
			var exec     = data[ "exec" ][ platform ];
			var fallback = data[ "fallback" ][ platform ];

			// validate command and use fallback paths if needed
			return this._validatePredefined( command, exec, fallback )
				.then(function( exec ) {
					var params = Parameter.getParameters(
						{ args: args, url : url },
						[ new ParameterCustom( null, "args", true ) ],
						[ new Substitution( "url", "url" ) ]
					);

					return launch( exec, params );
				});
		},

		_validatePredefined: function( command, executables, fallbacks ) {
			// user has set a custom executable path
			if ( command.length ) {
				// validate command:
				// check if the command's executable name is equal to one of the given ones
				var exec = PATH.basename( command );
				return executables.indexOf( exec ) !== -1
					? which( command, checkExec )
					: Promise.reject( new Error( "Invalid command" ) );

			} else {
				// look for matching executables inside the $PATH variable first
				return executables.reduce(function( chain, exec ) {
					return chain.catch(function() {
						// check file
						return which( exec, checkExec );
					});
				}, Promise.reject() )
					.catch( function() {
						// or look for matching executables in a list of fallback paths
						return fallbacks.reduce(function( chain, fallback ) {
							return chain.catch(function() {
								// resolve env variables
								fallback = resolvePath( fallback );
								// append each executable to the current path
								return executables.reduce(function( chain, exec ) {
									return chain.catch(function() {
										var file = PATH.join( fallback, exec );
										// check file (absolute path)
										return which( file, checkExec );
									});
								}, Promise.reject() );
							});
						}, Promise.reject() );
					});
			}
		},


		_openMSIE: function( url ) {
			var data   = get( this, "chatMethods.msie" );
			var args   = data[ "args" ];
			var exec   = data[ "exec" ];
			var script = data[ "script" ];

			// the script needs to be inside the application's folder
			var dir    = PATH.dirname( process.execPath );
			var file   = PATH.join( dir, script );

			return stat( file )
				.then(function() {
					var params = Parameter.getParameters(
						{
							args  : args,
							script: file,
							url   : url
						},
						[
							new ParameterCustom( null, "args", true )
						],
						[
							new Substitution( "url", "url" ),
							new Substitution( "script", "script" )
						]
					);

					return launch( exec, params );
				});
		},


		_openCustom: function( command, channel, url ) {
			var params = Parameter.getParameters(
				{
					command: command,
					channel: channel,
					url    : url
				},
				[
					new ParameterCustom( null, "command", true )
				],
				[
					new Substitution( "url", "url" ),
					new Substitution( "channel", "channel" )
				]
			);
			var exec = params.shift();

			return which( exec, checkExec )
				.then(function() {
					return launch( exec, params );
				});
		}
	});

});
