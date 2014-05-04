define( [ "ember" ], function( Ember ) {

	var	FS		= require( "fs" ),
		isWin	= /win/.test( process.platform ),
		PATH	= process.env.PATH || process.env.Path || process.env.path || ".",
		PATHS	= PATH.split( isWin ? ";" : ":" ),
		EXTS	= [ ".exe" ]; // isWin ? process.env.PATHEXT.split( ";" ) : null;


	/**
	 * Check if the path for livestreamer is valid
	 * TODO: maybe also check if the file really is livestreamer? `livestreamer --version`
	 * @param {string} path A user defined path
	 * @param {string} exec The default command
	 * @returns {boolean|string}
	 */
	function checkLivestreamer( path, exec ) {
		// use the default command if the user did not define one
		path = path ? String( path ) : exec;

		// check for invalid values first
		return	path.indexOf( exec ) !== -1
		// then check for the executable
			&&	which( path );
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

		model: function() {
			return this.get( "controllers.application.model" );
		}.property( "controllers.application.model" ),

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

		actions: {
			start: function( settings, stream ) {
				var	livestreamer,
					command,

					modal = this.get( "controllers.modal" ),
					exec = this.get( "model.package.config.livestreamer-exec" ),
					path = settings.get( "livestreamer" ),

					qualities = settings.get( "qualities" ),
					quality = settings.get( "quality" ),
					args = [];

				// Prepare parameters
				this.parameters.forEach(function( elem ) {
					if ( elem.cond.every(function( cond ) {
						return !!settings.get( cond );
					}) ) {
						[].push.apply( args, [ elem.arg ].concat(
							elem.params.map(function( param ) {
								return settings.get( param );
							}) )
						);
					}
				});

				args = args.concat([
					stream.channel.url,
					qualities.hasOwnProperty( quality )
						? qualities[ quality ].quality
						: qualities[ 0 ].quality
				]);

				// Dialog
				this.send( "openModal",
					"Preparing",
					"Please wait...",
					[ new modal.Button( "Close", "btn-danger", "fa-times", kill ) ]
				);

				// prepare the command and validate
				command = checkLivestreamer( path, exec );
				if ( !command ) {
					this.send( "updateModal",
						"Error: Livestreamer was not found",
						"Please check settings and/or (re)install Livestreamer."
					);

				} else {
					this.send( "updateModal",
						"Watching now: " + stream.channel.name,
						stream.channel.status
					);

					// start the child process
					livestreamer = require( "child_process" ).spawn( command, args );

					livestreamer && livestreamer.on( "exit", function () {
						this.send( "closeModal" );
					}.bind( this ) );
				}

				function kill() {
					livestreamer && livestreamer.kill( "SIGTERM" );
				}
			}
		}
	});

});
