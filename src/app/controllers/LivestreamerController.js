define( [ "ember", "utils/which", "utils/semver" ], function( Ember, which, semver ) {

	var	CP	= require( "child_process" ),
		get	= Ember.get;


	function VersionError( version ) { this.version = version; }
	VersionError.prototype = new Error();

	function NotFoundError() {}
	NotFoundError.prototype = new Error();


	function Parameter( arg, params, cond ) {
		this.arg	= arg;
		this.params	= Ember.makeArray( params );
		this.cond	= Ember.makeArray( cond );
	}


	function Stream( spawn, stream ) {
		this.spawn	= spawn;
		this.stream	= stream;
		this.name	= get( stream, "channel.name" );
	}

	Stream.prototype.kill = function( callback ) {
		this.spawn.killCallback = callback;
		this.spawn.kill( "SIGTERM" );
	};


	return Ember.ObjectController.extend({
		needs: [ "application", "modal" ],

		globalsBinding: "controllers.application.model",
		windowBinding: "controllers.application.nwWindow",
		configBinding: "globals.package.config",

		versionMinBinding: "config.livestreamer-version-min",
		versionParameters: [ "--version", "--no-version-check" ],
		versionRegExp: /^livestreamer(?:\.exe)? (\d+\.\d+.\d+)(.*)$/,
		versionTimeout: 2000,

		streams: [],

		parameters: [
			new Parameter( "--no-version-check" ),
			new Parameter( "--player", "player", "player" ),
			new Parameter( "--player-args", "player_params", [ "player", "player_params" ] ),
			new Parameter( "--player-continuous-http", null, "player_reconnect" ),
			new Parameter( "--player-no-close", null, "player_no_close" )
		],

		getParametersString: function( settings, stream, quality ) {
			var	args = [],
				qualities = get( settings, "qualities" );

			// default quality
			if ( quality === undefined ) {
				quality = get( settings, "quality" );
			}

			// prepare parameters
			this.parameters.forEach(function( elem ) {
				if ( elem.cond.every(function( cond ) {
					return !!get( settings, cond );
				}) ) {
					[].push.apply( args, [ elem.arg ].concat(
						elem.params.map(function( param ) {
							return get( settings, param );
						})
					));
				}
			});

			return args.concat([
				get( stream, "channel.url" ),
				qualities.hasOwnProperty( quality )
					? qualities[ quality ].quality
					: qualities[ 0 ].quality
			]);
		},


		prepare: function() {
			var	defer = Promise.defer(),
				modal = get( this, "controllers.modal" );

			this.send( "openModal",
				"Preparing",
				"Please wait...",
				[ new modal.ButtonClose( defer.reject ) ]
			);

			// read current settings
			this.store.find( "settings", 1 ).then(function( settings ) {

				// validate and get the exec command
				this.checkLivestreamer( get( settings, "livestreamer" ) )
					// proceed with outer promise
					.then(function( exec ) {
						defer.resolve([ settings, exec ]);
					})
					// livestreamer not found or invalid
					.catch(function( err ) {
						var	controls = [
								new modal.ButtonClose(),
								new modal.ButtonDownload(
									get( this, "config.livestreamer-download-url" )
								)
							];
						if ( err instanceof VersionError ) {
							this.send( "updateModal",
								"Error: Invalid Livestreamer version",
								"Your version v%@ does not match the minimum requirements (v%@)"
									.fmt( err.version, get( this, "versionMin" ) ),
								controls
							);
						} else if ( err instanceof NotFoundError ) {
							this.send( "updateModal",
								"Error: Livestreamer was not found",
								"Please check settings and/or (re)install Livestreamer.",
								controls
							);
						}
						// reject the outer promise and show a generic error message if err exists
						defer.reject( err );
					}.bind( this ) );

			}.bind( this ) ).catch( defer.reject );

			return defer.promise;
		},

		/**
		 * Check the location of livestreamer and validate
		 * @param {string} path A user defined path
		 * @returns {Promise}
		 */
		checkLivestreamer: function( path ) {
			var exec = get( this, "config.livestreamer-exec" );

			// use the default command if the user did not define one
			path = path ? String( path ) : exec;

			// check for invalid values first
			if ( path.indexOf( exec ) === -1 ) {
				return Promise.reject( new NotFoundError() );
			}

			// check for the executable
			return which( path )
				.catch(function() {
					throw new NotFoundError();
				})
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
			var	params	= get( this, "versionParameters" ),
				regexp	= get( this, "versionRegExp" ),
				minimum	= get( this, "versionMin" ),
				time	= get( this, "versionTimeout" ),
				defer	= Promise.defer(),
				spawn	= CP.spawn( livestreamer, params );

			function failed( err ) {
				spawn = null;
				defer.reject( err );
			}

			// reject on error / exit
			spawn.on( "error", failed );
			spawn.on(  "exit", failed );

			// kill after a certain time
			setTimeout(function() {
				if ( spawn ) { spawn.kill( "SIGKILL" ); }
				failed( new Error( "timeout" ) );
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


		streamStart: function( settings, exec, stream ) {
			var	self	= this,
				defer	= Promise.defer(),
				modal	= get( this, "controllers.modal" ),
				streamObj;

			function createSpawn( quality ) {
				var	spawn = CP.spawn(
						exec,
						self.getParametersString( settings, stream, quality )
					);

				spawn.on( "error", defer.reject );
				spawn.on( "exit", function() {
					// stream was closed regularly
					if ( !spawn.killCallback || spawn.killCallback() !== false ) {
						delete spawn.killCallback;
						self.send( "closeModal" );

						// restore the GUI
						if ( get( settings, "gui_minimize" ) ) { get( self, "window" ).restore(); }

						// remove the stream from the streams list
						self.streams.removeObject( streamObj );
						streamObj = null;

						// also finish promise
						defer.resolve();
					}
					spawn = null;
				});

				// hide the GUI
				if ( get( settings, "gui_minimize" ) ) { get( self, "window" ).minimize(); }

				return spawn;
			}

			// add the new stream object to the streams list
			streamObj = new Stream( createSpawn(), stream );
			this.streams.addObject( streamObj );

			this.send( "updateModal",
				"Watching now: " + get( stream, "channel.name" ),
				get( stream, "channel.status" ),
				[
					new modal.Button( "Continue", "", "fa-reply", defer.resolve ),
					new modal.ButtonClose( streamObj.kill.bind( streamObj ) ),
					new modal.ButtonBrowser(
						"Chat",
						"fa-comments",
						get( this, "config.twitch-chat-url" )
							.replace( "{channel}", get( stream, "channel.name" ) ),
						false
					),
					new modal.Select(
						get( settings, "qualities" ),
						get( settings, "quality" ),
						"modalqualityselect",
						function() {
							streamObj.kill(function() {
								streamObj.spawn = createSpawn( this.selection.id );
								// do not close modal
								return false;
							}.bind( this ) );
						}
					)
				]
			);

			return defer.promise;
		},

		killAll: function() {
			this.streams.forEach(function( stream ) {
				stream.kill();
			});
		},

		actions: {
			"start": function( stream ) {
				// is the stream already running?
				if ( this.streams.findBy( "name", get( stream, "channel.name" ) ) ) {
					return;
				}

				// validate configuration
				this.prepare()
					// start the stream
					.then(function( data ) {
						return this.streamStart( data[0], data[1], stream );
					}.bind( this ) )
					// an error occured
					.catch(function( err ) {
						var modal = get( this, "controllers.modal" );
						this.send( "updateModal",
							"Error while trying to launch the stream",
							err.message || "Internal error",
							[ new modal.ButtonClose() ]
						);
					}.bind( this ) );
			}
		}
	});

});
