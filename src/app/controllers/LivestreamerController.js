define( [ "ember", "utils/which", "utils/semver" ], function( Ember, which, semver ) {

	var	CP	= require( "child_process" ),
		get	= Ember.get;


	function VersionError( version ) { this.version = version; }
	VersionError.prototype = new Error();

	function NotFoundError() {}
	NotFoundError.prototype = new Error();


	function Parameter( arg, cond, params ) {
		this.arg	= arg;
		this.params	= params;
		this.cond	= Ember.makeArray( cond );
	}


	function Stream( spawn, stream, quality ) {
		this.spawn		= spawn;
		this.stream		= stream;
		this.quality	= quality;
		this.name		= get( stream, "channel.name" );
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
		versionRegExpFail: /^usage: livestreamer(?:\.exe)? \[OPTIONS] \[URL] \[STREAM]$/,
		versionTimeout: 5000,

		streams: [],

		parameters: [
			new Parameter( "--no-version-check" ),
			new Parameter( "--player", null, "player" ),
			new Parameter( "--player-args", "player", "player_params" ),
			new Parameter( "--player-passthrough", null, "player_passthrough" ),
			new Parameter( "--player-continuous-http", [ "isHttp", "player_reconnect" ] ),
			new Parameter( "--player-no-close", "player_no_close" )
		],

		getParametersString: function( settings, stream, quality ) {
			var	args = [],
				qualities = get( settings, "qualities" );

			// prepare parameters
			this.parameters.forEach(function( parameter ) {
				if ( parameter.cond.concat( parameter.params || [] ).every(function( cond ) {
					return !!get( settings, cond );
				}) ) {
					[].push.apply( args, [ parameter.arg ].concat(
						parameter.params
							? get( settings, parameter.params )
							: []
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
								"Your version %@ does not match the minimum requirements (v%@)"
									.fmt( err.version, get( this, "versionMin" ) ),
								controls
							);
						} else if ( err instanceof NotFoundError ) {
							this.send( "updateModal",
								"Error: Livestreamer was not found",
								"Please check settings and/or (re)install Livestreamer.",
								controls
							);
						} else {
							// reject outer promise and show a generic error message if err exists
							return defer.reject( err );
						}
						defer.reject();
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
				regexp2	= get( this, "versionRegExpFail" ),
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
				var match;
				data = String( data ).trim();

				if ( regexp2.test( data ) ) {
					// handle livestreamer < v1.8.0 (no --no-version-check support)
					defer.reject( new VersionError( "UNKNOWN" ) );
				} else if ( match = regexp.exec( data ) ) {
					// resolve before process exit
					defer.resolve( match[1] );
				}
				// immediately kill the process
				spawn.kill( "SIGKILL" );
			});

			return defer.promise.then(function( version ) {
				return version === semver.getMax([ version, minimum ])
					? livestreamer
					: Promise.reject( new VersionError( "v" + version ) );
			});
		},


		streamStart: function( settings, exec, stream ) {
			var	self	= this,
				defer	= Promise.defer(),
				modal	= get( this, "controllers.modal" ),
				quality	= get( settings, "quality" ),
				streamObj;

			function createSpawn( quality ) {
				var	spawn = CP.spawn(
						exec,
						self.getParametersString( settings, stream, quality ),
						{ detached: true }
					);

				spawn.on( "error", defer.reject );
				spawn.on( "exit", function() {
					// stream was closed regularly
					if ( !spawn.killCallback || spawn.killCallback() !== false ) {
						delete spawn.killCallback;
						self.send( "closeModal" );

						// restore the GUI
						switch ( get( settings, "gui_minimize" ) ) {
							case "bar":
								get( self, "window" ).restore();
								break;
							case "tray":
								get( self, "controllers.application" ).winFromTray();
						}

						// remove the stream from the streams list
						self.streams.removeObject( streamObj );
						streamObj = null;

						// also finish promise
						defer.resolve();
					}
					spawn = null;
				});

				// hide the GUI
				switch ( get( settings, "gui_minimize" ) ) {
					case "bar":
						get( self, "window" ).minimize();
						break;
					case "tray":
						get( self, "controllers.application" ).winToTray();
				}

				return spawn;
			}

			// create a new stream object
			streamObj = new Stream( createSpawn( quality ), stream, quality );
			streamObj.changeQuality = function() {
				streamObj.quality = this.selection.id;
				streamObj.kill(function() {
					streamObj.spawn = createSpawn( streamObj.quality );
					// do not close modal
					return false;
				});
			};

			// add the new stream object to the streams list
			this.streams.addObject( streamObj );

			if ( get( settings, "gui_hidestreampopup" ) ) {
				this.send( "closeModal" );
			} else {
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
							streamObj.changeQuality
						)
					]
				);
			}

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
