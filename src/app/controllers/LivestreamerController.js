define( [ "ember" ], function( Ember ) {

	var	FS		= require( "fs" ),
		CP		= require( "child_process" ),
		isWin	= /^win/.test( process.platform ),
		PATH	= process.env.PATH || process.env.Path || process.env.path || ".",
		PATHS	= PATH.split( isWin ? ";" : ":" ),
		EXTS	= [ ".exe" ]; // isWin ? process.env.PATHEXT.split( ";" ) : null;


	/**
	 * Check if the path for livestreamer is valid
	 * TODO: maybe also check if the file really is livestreamer? `livestreamer --version`
	 * @param {string} path A user defined path
	 * @param {string} exec The default command
	 * @returns {Promise}
	 */
	function checkLivestreamer( path, exec ) {
		// use the default command if the user did not define one
		path = path ? String( path ) : exec;

		// check for invalid values first
		if ( path.indexOf( exec ) === -1 ) {
			return Promise.reject();
		}

		// then check for the executable
		return new Promise(function( resolve, reject ) {
			// TODO: make which() async
			//       will do this together with validation
			var res = which( path );
			if ( res !== false ) {
				resolve( res );
			} else {
				reject();
			}
		});
	}

	/**
	 * Locate a command
	 * @param {string} file
	 * @returns {boolean|string}
	 */
	function which( file ) {
		// absolute or relative
		if ( file.indexOf( isWin ? "\\" : "/" ) !== -1 ) {
			return checkFile( file ) && file;

		// search in every PATH
		} else {
			var check, j, i = 0, l = PATHS.length, m = EXTS.length;
			if ( isWin ) {
				for ( ; i < l; i++ ) {
					for ( j = 0; j < m; j++ ) {
						check = PATHS[ i ] + "\\" + file + EXTS[ j ];
						if ( checkFile( check ) ) {
							return check;
						}
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					check = PATHS[ i ] + "/" + file;
					if ( checkFile( check ) ) {
						return check;
					}
				}
			}

			return false;
		}
	}

	/**
	 * Does the file exist and is it executable?
	 * @param {string} file
	 * @returns {boolean}
	 */
	function checkFile( file ) {
		if ( !FS.existsSync( file ) ) { return false; }
		var stat = FS.statSync( file );
		return	stat.isFile()
			&&	!isWin
				// check for executable flag on non-windows
				? stat.mode & 0111
				// ?
				: true;
	}


	return Ember.ObjectController.extend({
		needs: [ "application", "modal" ],

		modelBinding: "controllers.application.model",

		configBinding: "model.package.config",

		parameters: [
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
				this.send( "openModal", "Preparing", "Please wait..." );

				// validate and prepare the exec command
				checkLivestreamer(
					settings.get( "livestreamer" ),
					this.get( "config.livestreamer-exec" )
				)
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

					// livestreamer not found
					.catch(function() {
						this.send( "updateModal",
							"Error: Livestreamer was not found",
							"Please check settings and/or (re)install Livestreamer.",
							[ btn_close, btn_download ]
						);
					}.bind( this ) );
			}
		}
	});

});
