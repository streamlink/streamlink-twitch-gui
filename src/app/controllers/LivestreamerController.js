define([
	"ember",
	"models/Livestreamer",
	"utils/which",
	"utils/semver"
], function( Ember, Livestreamer, which, semver ) {

	var CP  = require( "child_process" ),
	    get = Ember.get,
	    set = Ember.set;

	var isWin = /^win/.test( process.platform );

	var re_version   = /^livestreamer(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(.*)$/,
	    re_unable    = /^error: Unable to open URL: /,
	    re_nostreams = /^error: No streams found on this URL: /,
	    re_noplayer  = /^error: Failed to start player: /,
	    re_replace   = /^\[cli]\[\S+]\s+/,
	    re_player    = /^Starting player: \S+/;


	function VersionError( version ) { this.version = version; }
	VersionError.prototype = new Error();

	function NotFoundError() {}
	NotFoundError.prototype = new Error();

	function UnableToOpenError() {}
	UnableToOpenError.prototype = new Error();

	function NoStreamsFoundError() {}
	NoStreamsFoundError.prototype = new Error();

	function NoPlayerError() {}
	NoPlayerError.prototype = new Error();


	function Parameter( arg, cond, params ) {
		this.arg    = arg;
		this.params = params;
		this.cond   = cond instanceof Function
			? [ cond ]
			: Ember.makeArray( cond ).concat( params || [] ).map(function( prop ) {
				return function( settings ) {
					return get( settings, prop );
				};
			});
	}


	return Ember.Controller.extend({
		configBinding        : "metadata.package.config",
		versionMinBinding    : "config.livestreamer-version-min",
		versionTimeoutBinding: "config.livestreamer-validation-timeout",

		modalBtns        : null,
		modalBtnsDefault : Ember.computed.equal( "modalBtns", null ),
		modalBtnsDownload: Ember.computed.equal( "modalBtns", "download" ),
		modalBtnsRunning : Ember.computed.equal( "modalBtns", "running" ),

		streams: [],
		current: null,

		parameters: [
			new Parameter( "--no-version-check" ),
			new Parameter( "--player", null, "player" ),
			new Parameter( "--player-args", "player", "player_params" ),
			new Parameter( "--player-passthrough", null, "player_passthrough" ),
			new Parameter( "--player-continuous-http", function( settings ) {
				return "http" === get( settings, "player_passthrough" )
				    &&          !!get( settings, "player_reconnect" );
			}),
			new Parameter( "--player-no-close", "player_no_close" )
		],


		getParametersString: function( url, quality ) {
			var params    = [],
			    settings  = this.settings,
			    qualities = settings.constructor.qualities;

			// prepare parameters
			this.parameters.forEach(function( parameter ) {
				// a parameter must fulfill every condition
				if ( parameter.cond.every(function( cond ) {
					// a condition is always a function with the settings object passed
					return cond( settings );
				}) ) {
					// append process parameter arg and its own parameters (settings properties)
					[].push.apply( params, [ parameter.arg ].concat(
						parameter.params
							? get( settings, parameter.params )
							: []
					));
				}
			});

			// append stream url + quality and return the array
			return params.concat([
				url,
				( qualities[ quality ] || qualities[ 0 ] ).quality
			]);
		},


		startStream: function( stream ) {
			this.send( "openModal", {
				view    : "livestreamerModal",
				template: "livestreamerModal"
			}, this, {
				modalHead: "Preparing",
				modalBody: "Please wait...",
				modalBtns: null
			});

			// is the stream already running? compare by channel name (which is unique)
			var livestreamer = this.streams.findBy( "name", get( stream, "channel.name" ) );
			if ( livestreamer ) {
				set( this, "current", livestreamer );
				return this.setProperties({
					modalHead: "You're watching %@".fmt( get( livestreamer, "displayName" ) ),
					modalBody: get( livestreamer, "status" ),
					modalBtns: "running"
				});
			}

			// create a new livestreamer object
			livestreamer = Livestreamer.create({
				stream : stream,
				quality: get( this.settings, "quality" )
			});
			// modal belongs to this stream now
			set( this, "current", livestreamer );

			// validate configuration and get the exec command
			this.checkLivestreamer()
				// launch the stream
				.then(function( exec ) {
					this.setProperties({
						modalHead: "Launching stream",
						modalBody: "Waiting for Livestreamer to launch the stream..."
					});
					return this.launchLivestreamer( exec, livestreamer );
				}.bind( this ) )
				// add the stream object to the streams list
				.then(function() {
					this.streams.addObject( livestreamer );
				}.bind( this ) )
				// success/failure
				.then(
					this.streamSuccess.bind( this, livestreamer, true ),
					this.streamFailure.bind( this )
				);
		},

		streamSuccess: function( livestreamer, guiActions ) {
			this.setProperties({
				modalHead: "Watching now: %@".fmt( get( livestreamer, "displayName" ) ),
				modalBody: get( livestreamer, "status" ),
				modalBtns: "running"
			});

			if ( !guiActions ) { return; }

			// automatically close modal on success
			if ( get( this.settings, "gui_hidestreampopup" ) ) {
				set( this, "modal", null );
				this.send( "closeModal" );
			}

			// automatically open chat
			if ( get( this.settings, "gui_openchat" ) ) {
				this.send( "chat" );
			}

			// hide the GUI
			this.minimize( false );
		},

		streamFailure: function( err ) {
			if ( err instanceof VersionError ) {
				this.setProperties({
					modalHead: "Error: Invalid Livestreamer version",
					modalBody: "Your version v%@ doesn't match the min. requirements (v%@)"
						.fmt( err.version, get( this, "versionMin" ) ),
					modalBtns: "download"
				});
			} else if ( err instanceof NotFoundError ) {
				this.setProperties({
					modalHead: "Error: Livestreamer was not found",
					modalBody: "Please check settings and/or (re)install Livestreamer.",
					modalBtns: "download"
				});
			} else if ( err instanceof UnableToOpenError ) {
				this.setProperties({
					modalHead: "Error: Unable to open stream",
					modalBody: "Livestreamer was unable to open the stream.",
					modalBtns: null
				});
			} else if ( err instanceof NoStreamsFoundError ) {
				this.setProperties({
					modalHead: "Error: No streams found",
					modalBody: "Livestreamer was unable to find the stream.",
					modalBtns: null
				});
			} else if ( err instanceof NoPlayerError ) {
				this.setProperties({
					modalHead: "Error: Invalid player",
					modalBody: "Please check your player configuration.",
					modalBtns: null
				});
			} else {
				this.setProperties({
					modalHead: "Error: Couldn't launch the stream",
					modalBody: err
						? err.message || err.toString()
						: "Internal error",
					modalBtns: null
				});
			}
		},


		/**
		 * Check the location of livestreamer and validate
		 * @returns {Promise}
		 */
		checkLivestreamer: function() {
			var path = get( this.settings, "livestreamer" ),
			    exec = get( this, "config.livestreamer-exec" );

			// use the default command if the user did not define one
			path = path ? String( path ) : exec;

			// check for invalid values first
			if ( path.indexOf( exec ) === -1 ) {
				return Promise.reject( new NotFoundError() );
			}

			function execCheck( stat ) {
				return isWin || ( stat.mode & 0111 ) > 0;
			}

			// check for the executable
			return which( path, execCheck )
				.catch(function() { throw new NotFoundError(); })
			// check for correct version
				.then( this.validateLivestreamer.bind( this ) );
		},

		/**
		 * Validate livestreamer
		 * Runs the executable with `--version` parameters and reads answer from stderr
		 * @param {string} exec
		 * @returns {Promise}
		 */
		validateLivestreamer: function( exec ) {
			var minimum = get( this, "versionMin" ),
			    time    = get( this, "versionTimeout" ),
			    defer   = Promise.defer(),
			    spawn   = CP.spawn( exec, [ "--version", "--no-version-check" ] );

			function failed( err ) {
				spawn = null;
				defer.reject( err );
			}

			function onData( data ) {
				var match = re_version.exec( String( data ).trim() );
				if ( match ) {
					// resolve before process exit
					defer.resolve( match[1] );
				}
				// immediately kill the process
				spawn.kill( "SIGKILL" );
			}

			function onTimeout() {
				if ( spawn ) { spawn.kill( "SIGKILL" ); }
				failed( new Error( "timeout" ) );
			}

			// reject on error / exit
			spawn.on( "error", failed );
			spawn.on(  "exit", failed );

			// only check the first chunk of data
			spawn.stdout.on( "data", onData );
			spawn.stderr.on( "data", onData );

			// kill after a certain time
			setTimeout( onTimeout, time );

			return defer.promise.then(function( version ) {
				return version === semver.getMax([ version, minimum ])
					? Promise.resolve( exec )
					: Promise.reject( new VersionError( version ) );
			});
		},


		launchLivestreamer: function( exec, livestreamer ) {
			// in case the shutdown button was pressed before
			if ( get( livestreamer, "shutdown" ) ) {
				return Promise.reject();
			}

			var defer    = Promise.defer(),
			    url      = get( livestreamer, "url" ),
			    quality  = get( livestreamer, "quality" ),
			    params   = this.getParametersString( url, quality ),
			    spawn    = CP.spawn( exec, params, { detached: true } );

			set( livestreamer, "spawn", spawn );

			spawn.on( "error", defer.reject );
			spawn.on( "exit", function() {
				// clear up some memory
				set( livestreamer, "spawn", null );
				spawn = null;

				// quality was changed
				if ( quality !== get( livestreamer, "quality" ) ) {
					Ember.run.next( this, function() {
						this.launchLivestreamer( exec, livestreamer ).then(
							this.streamSuccess.bind( this, livestreamer, false ),
							this.streamFailure.bind( this )
						);
					});

				// stream was shut down regularly
				} else {
					// close the modal only if there was no error and if it belongs to the stream
					if (
						  !get( livestreamer, "isError" )
						&& get( this, "current" ) === livestreamer
					) {
						this.send( "close" );
					}

					// restore the GUI
					this.minimize( true );

					// remove the stream from the streams list
					this.streams.removeObject( livestreamer );
				}
			}.bind( this ) );

			// we need a common error parsing function for stdout and stderr, because
			// livestreamer is weird sometimes and prints error messages to stdout instead... :(
			function parseError( data ) {
				if ( re_unable.test( data ) ) {
					return new UnableToOpenError();
				} else if ( re_nostreams.test( data ) ) {
					return new NoStreamsFoundError();
				} else if ( re_noplayer.test( data ) ) {
					return new NoPlayerError();
				}
			}

			// reject promise on any error output
			spawn.stderr.on( "data", function( data ) {
				data = String( data ).trim();
				set( livestreamer, "isError", true );
				defer.reject( parseError( data ) || new Error( data ) );
			});

			// fulfill promise as soon as livestreamer is launching the player
			// also print all stdout messages
			spawn.stdout.on( "data", function( data ) {
				data = String( data ).trim();
				var error = parseError( data );
				if ( error ) {
					set( livestreamer, "isError", true );
					return defer.reject( error );
				}

				data = data.replace( re_replace, "" );
				if ( get( this, "current" ) === livestreamer ) {
					set( this, "modalBody", data );
				}
				if ( re_player.test( data ) ) {
					/*
					 * FIXME:
					 * The promise should resolve at the point when livestreamer is launching the
					 * player. The only way of doing this is reading from stdout. The issue here
					 * is though, that in case the user has set an invalid player path, we don't
					 * know it yet, because the error message is being sent afterwards (and also
					 * in stdout instead of stderr - worth of a bug report?).
					 * The stupid solution is adding a short delay. This is again stupid, because
					 * we don't know how long the machine of the user takes for launching the player
					 * or detecting an invalid path, etc.
					 */
					Ember.run.later( defer, defer.resolve, 500 );
				}
			}.bind( this ) );

			return defer.promise;
		},


		killAll: function() {
			this.streams.forEach(function( stream ) {
				stream.kill();
			});
		},

		minimize: function( restore ) {
			switch ( get( this.settings, "gui_minimize" ) ) {
				// minimize
				case 1:
					this.nwWindow.toggleMinimize( restore );
					break;
				// move to tray: toggle window and taskbar visibility
				case 2:
					this.nwWindow.toggleVisibility( restore );
					if ( get( this.settings, "isVisibleInTaskbar" ) ) {
						this.nwWindow.setShowInTaskbar( restore );
					}
					break;
			}
		},


		actions: {
			"download": function( callback ) {
				this.send( "openBrowser", get( this, "config.livestreamer-download-url" ) );
				if ( callback ) { callback(); }
			},

			"close": function() {
				set( this, "current", null );
				this.send( "closeModal" );
			},

			"shutdown": function() {
				var current = get( this, "current" ),
				    spawn;
				if ( current ) {
					set( current, "shutdown", true );
					spawn = get( current, "spawn" );
					if ( spawn ) { spawn.kill(); }
				}
				this.send( "close" );
			},

			"chat": function( callback ) {
				var url  = get( this, "config.twitch-chat-url" ),
				    name = get( this, "current.stream.channel.name" );
				if ( name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
				}
				if ( callback ) { callback(); }
			},

			"share": function( callback ) {
				var url = get( this, "current.stream.channel.url" ),
				    cb  = this.nwGui.Clipboard.get();
				if ( url && cb ) {
					cb.set( url, "text" );
					if ( callback ) { callback(); }
				}
			}
		}
	});

});
