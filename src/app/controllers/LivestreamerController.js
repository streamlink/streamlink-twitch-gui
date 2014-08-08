define( [ "ember", "utils/which", "utils/semver" ], function( Ember, which, semver ) {

	var CP = require( "child_process" );

	function VersionError( version ) { this.version = version; }
	VersionError.prototype = new Error();


	return Ember.ObjectController.extend({
		needs: [ "application", "modal" ],

		modelBinding: "controllers.application.model",

		configBinding: "model.package.config",

		versionMinBinding: "config.livestreamer-version-min",
		versionParameters: [ "--version", "--no-version-check" ],
		versionRegExp: /^livestreamer(?:\.exe)? (\d+\.\d+.\d+)(.*)$/,
		versionTimeout: 2000,

		parameters: [
			{
				arg		: "--no-version-check",
				params	: [],
				cond	: []
			},
			{
				arg		: "--player",
				params	: [ "player" ],
				cond	: [ "player" ]
			},
			{
				arg		: "--player-args",
				params	: [ "player_params" ],
				cond	: [ "player", "player_params" ]
			},
			{
				arg		: "--player-continuous-http",
				params	: [],
				cond	: [ "player_reconnect" ]
			},
			{
				arg		: "--player-no-close",
				params	: [],
				cond	: [ "player_no_close" ]
			}
		],

		getParametersString: function( settings, stream, quality ) {
			var	args = [],
				qualities = settings.get( "qualities" );

			// default quality
			if ( quality === undefined ) {
				quality = settings.get( "quality" );
			}

			// prepare parameters
			this.parameters.forEach(function( elem ) {
				if ( elem.cond.every(function( cond ) {
					return !!settings.get( cond );
				}) ) {
					[].push.apply( args, [ elem.arg ].concat(
						elem.params.map(function( param ) {
							return settings.get( param );
						})
					));
				}
			});

			return args.concat([
				Ember.get( stream, "channel.url" ),
				qualities.hasOwnProperty( quality )
					? qualities[ quality ].quality
					: qualities[ 0 ].quality
			]);
		},

		/**
		 * Check the location of livestreamer and validate
		 * @param {string} path A user defined path
		 * @returns {Promise}
		 */
		checkLivestreamer: function( path ) {
			var exec = this.get( "config.livestreamer-exec" );

			// use the default command if the user did not define one
			path = path ? String( path ) : exec;

			// check for invalid values first
			if ( path.indexOf( exec ) === -1 ) {
				return Promise.reject();
			}

			// check for the executable
			return which( path )
			// check for correct version
				.then( this.validateLivestreamer.bind( this ) );
		},

		/**
		 * Validate livestreamer
		 * Runs the executable with `--version` parameters and reads answer from stderr
		 * @param {string} livestreamer
		 * @returns {Promise}
		 */
		validateLivestreamer: function( livestreamer ) {
			var	params	= this.get( "versionParameters" ),
				regexp	= this.get( "versionRegExp" ),
				minimum	= this.get( "versionMin" ),
				time	= this.get( "versionTimeout" ),
				defer	= Promise.defer(),
				spawn	= CP.spawn( livestreamer, params );

			function failed() {
				spawn = null;
				defer.reject();
			}

			// reject on error / exit
			spawn.on( "error", failed );
			spawn.on(  "exit", failed );

			// kill after a certain time
			setTimeout(function() {
				if ( spawn ) { spawn.kill( "SIGKILL" ); }
				failed();
			}, time );

			// only check the first chunk of data
			spawn.stderr.on( "data", function( data ) {
				var match = regexp.exec( String( data ).trim() );
				if ( match ) {
					// resolve before process exit
					defer.resolve( match[1] );
				}
				// immediately kill the process
				spawn.kill( "SIGKILL" );
			});

			return defer.promise.then(function( version ) {
				return version === semver.getMax([ version, minimum ])
					? livestreamer
					: Promise.reject( new VersionError( version ) );
			});
		},

		actions: {
			start: function( settings, stream ) {
				var	win = this.get( "controllers.application.nwWindow" ),
					modal = this.get( "controllers.modal" ),

					quality = settings.get( "quality" ),
					qualities = settings.get( "qualities" ),
					gui_minimize = settings.get( "gui_minimize" ) !== false,


					// child process related
					spawn,
					exec,
					streamCloseCallback = null,

					streamClose = function( callback ) {
						if ( !spawn ) { return; }
						streamCloseCallback = callback;
						spawn.kill( "SIGTERM" );
					},

					streamStart = function( quality ) {
						if ( spawn ) { return; }

						// start child process
						spawn = CP.spawn(
							exec,
							this.getParametersString( settings, stream, quality )
						);

						if ( !spawn ) { return; }

						spawn.on( "exit", function() {
							spawn = null;

							// don't close the modal if the callback returns false
							if ( !streamCloseCallback || streamCloseCallback() !== false ) {
								streamCloseCallback = null;

								this.send( "closeModal" );

								// restore the GUI
								if ( win && gui_minimize ) { win.restore(); }
							}
						}.bind( this ) );

						// hide the GUI
						if ( win && gui_minimize ) { win.minimize(); }
					}.bind( this ),


					// modal controls
					btn_close = new modal.Button( "Close", "btn-danger", "fa-times",
						streamClose
					),
					btn_download = new modal.Button( "Download", "btn-success", "fa-download",
						function() {
							var url = this.get( "config.livestreamer-download-url" );
							this.send( "open_browser", url );
						}.bind( this )
					),
					btn_chat = new modal.Button( "Open Chat", "btn-success", "fa-comments",
						function() {
							var	url = this.get( "config.twitch-chat-url" ).replace(
									"{channel}",
									Ember.get( stream, "channel.name" )
								);
							this.send( "open_browser", url );
							// don't close modal on click
							return false;
						}.bind( this )
					),
					sel_qualities = new modal.Select( qualities, quality, "modalqualityselect",
						function() {
							streamClose(function() {
								// restart stream with new quality
								streamStart( this.selection.id );
								// do not close modal
								return false;
							}.bind( this ) )
						}
					);


				// show dialog
				this.send( "openModal", "Preparing", "Please wait...", [ btn_close ] );

				// validate and prepare the exec command
				this.checkLivestreamer( settings.get( "livestreamer" ) )

					// livestreamer found
					.then(function( cmd ) {
						// set the exec command in the upper scope
						exec = cmd;
						this.send( "updateModal",
							"Watching now: " + Ember.get( stream, "channel.name" ),
							Ember.get( stream, "channel.status" ),
							[ btn_close, btn_chat, sel_qualities ]
						);
						// start the stream
						streamStart();
					}.bind( this ) )

					// livestreamer not found or invalid
					.catch(function( err ) {
						if ( err instanceof VersionError ) {
							this.send( "updateModal",
								"Error: Invalid Livestreamer version",
								"Your version v%@ does not match the minimum requirements (v%@)"
									.fmt( err.version, this.get( "versionMin" ) ),
								[ btn_close, btn_download ]
							);
						} else {
							this.send( "updateModal",
								"Error: Livestreamer was not found",
								"Please check settings and/or (re)install Livestreamer.",
								[ btn_close, btn_download ]
							);
						}
					}.bind( this ) );
			}
		}
	});

});
