define([
	"nwGui",
	"nwWindow",
	"ember",
	"controllers/ChannelControllerMixin",
	"models/Livestreamer",
	"utils/fs/which",
	"utils/fs/stat",
	"utils/semver"
], function(
	nwGui,
	nwWindow,
	Ember,
	ChannelControllerMixin,
	Livestreamer,
	which,
	stat,
	semver
) {

	var CP   = require( "child_process" ),
	    PATH = require( "path" );

	var get  = Ember.get,
	    set  = Ember.set,
	    setP = Ember.setProperties,
	    run  = Ember.run;

	var isWin = process.platform === "win32";

	var reVersion   = /^livestreamer(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(.*)$/,
	    reUnable    = /^error: Unable to open URL: /,
	    reNoStreams = /^error: No streams found on this URL: /,
	    reNoPlayer  = /^error: Failed to start player: /,
	    reNoPlayer2 = /^error: The default player \(.+\) does not seem to be installed\./,
	    reReplace   = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/,
	    rePlayer    = /^Starting player: \S+/,
	    reSplit     = /\r?\n/g;


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
				return function() {
					return !!get( this, prop );
				};
			});
	}


	return Ember.Controller.extend( ChannelControllerMixin, {
		versionMin    : Ember.computed.readOnly( "config.livestreamer-version-min" ),
		versionTimeout: Ember.computed.readOnly( "config.livestreamer-validation-timeout" ),

		streamURL: "twitch.tv/%@",

		modalBtns: null,

		streams: [],
		active : null,

		parameters: [
			new Parameter( "--no-version-check" ),
			new Parameter( "--player", null, "settings.player" ),
			new Parameter( "--player-args", "settings.player", "settings.player_params" ),
			new Parameter( "--player-passthrough", null, "settings.player_passthrough" ),
			new Parameter( "--player-continuous-http", function() {
				return "http" === get( this, "settings.player_passthrough" )
				    &&          !!get( this, "settings.player_reconnect" );
			}),
			new Parameter( "--player-no-close", "settings.player_no_close" ),
			new Parameter( "--twitch-oauth-token", "auth.isLoggedIn", "auth.access_token" )
		],


		getParametersString: function( name, quality ) {
			var self      = this,
			    params    = [],
			    settings  = this.settings,
			    qualities = settings.constructor.qualities;

			// prepare parameters
			this.parameters.forEach(function( parameter ) {
				// a parameter must fulfill every condition
				if ( parameter.cond.every(function( cond ) {
					return cond.call( self );
				}) ) {
					// append process parameter arg and its own parameters (settings properties)
					params.push.apply( params, [ parameter.arg ].concat(
						parameter.params
							? get( self, parameter.params )
							: []
					));
				}
			});

			// append stream url + quality and return the array
			return params.concat([
				get( this, "streamURL" ).fmt( name ),
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


			var channel = get( stream, "channel" );

			// is the stream already running? compare by channel
			var livestreamer = this.streams.findBy( "channel.id", get( channel, "id" ) );
			if ( livestreamer ) {
				set( this, "active", livestreamer );
				return setP( this, {
					modalHead: "You're watching %@".fmt( get( channel, "display_name" ) ),
					modalBody: get( channel, "status" ),
					modalBtns: "running"
				});
			}

			// create a new livestreamer object
			livestreamer = Livestreamer.create({
				stream : stream,
				channel: channel,
				quality: get( this.settings, "quality" )
			});
			// modal belongs to this stream now
			set( this, "active", livestreamer );

			// validate configuration and get the exec command
			this.checkLivestreamer()
				// launch the stream
				.then(function( exec ) {
					setP( this, {
						modalHead: "Launching stream",
						modalBody: "Waiting for Livestreamer to launch the stream..."
					});
					return this.launchLivestreamer( exec, livestreamer );
				}.bind( this ) )
				// check if the user subscribes the channel
				.then( this.checkUserSubscribesChannel.bind( this, channel ) )
				// check if the user follows the channel
				.then( this.checkUserFollowsChannel.bind( this, channel ) )
				// setup stream refresh interval
				.then( this.refreshStream.bind( this, livestreamer ) )
				// add the livestreamer object to the streams list
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
			setP( this, {
				modalHead: "Watching now: %@".fmt( get( livestreamer, "channel.display_name" ) ),
				modalBody: get( livestreamer, "channel.status" ),
				modalBtns: "running"
			});
			set( livestreamer, "success", true );

			if ( !guiActions ) { return; }

			// automatically close modal on success
			if ( get( this.settings, "gui_hidestreampopup" ) ) {
				this.send( "close" );
			}

			// automatically open chat
			if ( get( this.settings, "gui_openchat" ) ) {
				this.send( "chat", get( livestreamer, "channel" ) );
			}

			// hide the GUI
			this.minimize( false );
		},

		streamFailure: function( err ) {
			if ( err instanceof VersionError ) {
				setP( this, {
					modalHead: "Error: Invalid Livestreamer version",
					modalBody: "Your version v%@ doesn't match the min. requirements (v%@)"
						.fmt( err.version, get( this, "versionMin" ) ),
					modalBtns: "download"
				});
			} else if ( err instanceof NotFoundError ) {
				setP( this, {
					modalHead: "Error: Livestreamer was not found",
					modalBody: "Please check settings and/or (re)install Livestreamer.",
					modalBtns: "download"
				});
			} else if ( err instanceof UnableToOpenError ) {
				setP( this, {
					modalHead: "Error: Unable to open stream",
					modalBody: "Livestreamer was unable to open the stream.",
					modalBtns: null
				});
			} else if ( err instanceof NoStreamsFoundError ) {
				setP( this, {
					modalHead: "Error: No streams found",
					modalBody: "Livestreamer was unable to find the stream.",
					modalBtns: null
				});
			} else if ( err instanceof NoPlayerError ) {
				setP( this, {
					modalHead: "Error: Invalid player",
					modalBody: "Please check your player configuration.",
					modalBtns: null
				});
			} else {
				setP( this, {
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
			    exec = get( this, "config.livestreamer-exec" ),
			    fb   = get( this, "config.livestreamer-fallback-path-unix" );

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
				// check fallback path
				.catch(function() {
					if ( !isWin ) {
						fb = PATH.join( PATH.resolve( fb ), exec );
						return stat( fb, execCheck );
					}
					return Promise.reject();
				})
				// not found
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
				var match = reVersion.exec( String( data ).trim() );
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
			run.later( onTimeout, time );

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
			    channel  = get( livestreamer, "channel" ),
			    name     = get( channel, "id" ),
			    quality  = get( livestreamer, "quality" ),
			    params   = this.getParametersString( name, quality ),
			    spawn    = CP.spawn( exec, params, { detached: true } );

			set( livestreamer, "success", false );
			set( livestreamer, "spawn", spawn );

			spawn.on( "error", defer.reject );
			spawn.on( "exit", function() {
				// clear up some memory
				set( livestreamer, "spawn", null );
				spawn = null;

				// quality was changed
				if ( quality !== get( livestreamer, "quality" ) ) {
					run.next( this, function() {
						this.launchLivestreamer( exec, livestreamer ).then(
							this.streamSuccess.bind( this, livestreamer, false ),
							this.streamFailure.bind( this )
						);
					});

				// stream was shut down regularly
				} else {
					set( livestreamer, "shutdown", true );

					// close the modal only if there was no error and if it belongs to the stream
					if (
						  !get( livestreamer, "error" )
						&& get( this, "active" ) === livestreamer
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
				if ( reUnable.test( data ) ) {
					return new UnableToOpenError();
				} else if ( reNoStreams.test( data ) ) {
					return new NoStreamsFoundError();
				} else if ( reNoPlayer.test( data ) || reNoPlayer2.test( data ) ) {
					return new NoPlayerError();
				}
			}

			// reject promise on any error output
			function stderrCallback( data ) {
				data = data.trim();
				set( livestreamer, "error", true );
				defer.reject( parseError( data ) || new Error( data ) );
			}

			// fulfill promise as soon as livestreamer is launching the player
			// also print all stdout messages
			function stdoutCallback( data ) {
				data = data.trim();
				var error = parseError( data );
				if ( error ) {
					set( livestreamer, "error", true );
					return defer.reject( error );
				}

				data = data.replace( reReplace, "" );
				if (
					    get( this, "active" ) === livestreamer
					&& !get( livestreamer, "error" )
				) {
					set( this, "modalBody", data );
				}
				if ( rePlayer.test( data ) ) {
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
					run.later( defer, defer.resolve, 500 );
				}
			}

			spawn.stderr.on( "data", function( data ) {
				String( data ).trim().split( reSplit ).forEach( stderrCallback );
			});

			spawn.stdout.on( "data", function( data ) {
				String( data ).trim().split( reSplit ).forEach( stdoutCallback.bind( this ) );
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
					nwWindow.toggleMinimize( restore );
					break;
				// move to tray: toggle window and taskbar visibility
				case 2:
					nwWindow.toggleVisibility( restore );
					if ( get( this.settings, "isVisibleInTaskbar" ) ) {
						nwWindow.setShowInTaskbar( restore );
					}
					break;
			}
		},

		refreshStream: function( livestreamer ) {
			var interval = get( this, "config.stream-reload-interval" ) || 60000;

			if ( get( livestreamer, "shutdown" ) ) { return; }

			var stream  = get( livestreamer, "stream" );
			var reload  = stream.reload.bind( stream );
			var promise = reload();

			// try to reload the record at least 3 times
			for ( var i = 1; i < 3; i++ ) {
				promise = promise.catch( reload );
			}

			// queue another refresh
			promise.then(function() {
				run.later( this, this.refreshStream, livestreamer, interval );
			}.bind( this ) );
		},


		actions: {
			"download": function( callback ) {
				this.send( "openBrowser", get( this, "config.livestreamer-download-url" ) );
				if ( callback instanceof Function ) {
					callback();
				}
			},

			"close": function() {
				set( this, "active", null );
				this.send( "closeModal" );
			},

			"shutdown": function() {
				var active = get( this, "active" ),
				    spawn;
				if ( active ) {
					set( active, "shutdown", true );
					spawn = get( active, "spawn" );
					if ( spawn ) { spawn.kill(); }
				}
				this.send( "close" );
			}
		}
	});

});
