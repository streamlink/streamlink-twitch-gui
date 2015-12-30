define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"models/localstorage/Settings",
	"mixins/ChannelSettingsMixin",
	"utils/fs/which",
	"utils/fs/stat",
	"utils/StreamOutputBuffer",
	"utils/semver",
	"commonjs!child_process",
	"commonjs!path"
], function(
	Ember,
	nwGui,
	nwWindow,
	Settings,
	ChannelSettingsMixin,
	which,
	stat,
	StreamOutputBuffer,
	semver,
	CP,
	PATH
) {

	var get = Ember.get;
	var set = Ember.set;
	var run = Ember.run;
	var merge = Ember.merge;

	var isWin = process.platform === "win32";

	var reVersion   = /^livestreamer(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(.*)$/;
	var reReplace   = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/;
	var reUnable    = /^error: Unable to open URL: /;
	var reNoStreams = /^error: No streams found on this URL: /;
	var reNoPlayer  = /^error: Failed to start player: /;
	var reNoPlayer2 = /^error: The default player \(.+\) does not seem to be installed\./;
	var reWarnInsec = /InsecurePlatformWarning: A true SSLContext object is not available\./;
	var rePlayer    = /^Starting player: \S+/;


	function VersionError( version ) { this.version = version; }
	VersionError.prototype = merge( new Error(), { name: "VersionError" });

	function NotFoundError() {}
	NotFoundError.prototype = merge( new Error(), { name: "NotFoundError" });

	function UnableToOpenError() {}
	UnableToOpenError.prototype = merge( new Error(), { name: "UnableToOpenError" });

	function NoStreamsFoundError() {}
	NoStreamsFoundError.prototype = merge( new Error(), { name: "NoStreamsFoundError" });

	function NoPlayerError() {}
	NoPlayerError.prototype = merge( new Error(), { name: "NoPlayerError" });

	function Warning( message ) { this.message = message; }
	Warning.prototype = merge( new Error(), { name: "Warning" } );


	function execCheck( stat ) {
		// octal: 0111
		return isWin || ( stat.mode & 73 ) > 0;
	}


	// we need a common error parsing function for stdout and stderr, because
	// livestreamer is weird sometimes and prints error messages to stdout instead... :(
	function parseError( data ) {
		if ( reUnable.test( data ) ) {
			return new UnableToOpenError();
		} else if ( reNoStreams.test( data ) ) {
			return new NoStreamsFoundError();
		} else if ( reNoPlayer.test( data ) || reNoPlayer2.test( data ) ) {
			return new NoPlayerError();
		} else if ( reWarnInsec.test( data ) ) {
			return new Warning( data );
		}
	}


	function setIfNotNull( objA, objB, key ) {
		var val = get( objA, key );
		if ( val !== null ) {
			set( objB, key, val );
		}
	}


	return Ember.Controller.extend( ChannelSettingsMixin, {
		metadata: Ember.inject.service(),
		store   : Ember.inject.service(),
		settings: Ember.inject.service(),
		chat    : Ember.inject.service(),

		error : null,
		active: null,
		abort : false,
		model : function() {
			var store = get( this, "store" );
			return store.peekAll( "livestreamer" );
		}.property(),


		startStream: function( stream, quality ) {
			this.send( "openModal", "livestreamer", this, {
				error : null,
				active: null,
				abort : false
			});

			var store   = get( this, "store" );
			var channel = get( stream, "channel" );
			var id      = get( channel, "id" );

			// is the stream already running?
			if ( store.hasRecordForId( "livestreamer", id ) ) {
				return set( this, "active", store.recordForId( "livestreamer", id ) );
			}

			// create a new livestreamer object
			var livestreamer = store.createRecord( "livestreamer", {
				id          : id,
				stream      : stream,
				channel     : channel,
				quality     : get( this, "settings.quality" ),
				gui_openchat: get( this, "settings.gui_openchat" ),
				started     : new Date()
			});

			this.loadChannelSettings( id )
				// override channel specific settings
				.then(function( settings ) {
					if ( quality === undefined ) {
						setIfNotNull( settings, livestreamer, "quality" );
					} else {
						set( livestreamer, "quality", quality );
					}
					setIfNotNull( settings, livestreamer, "gui_openchat" );
				})
				// validate configuration and get the exec command
				.then( this.checkLivestreamer.bind( this ) )
				.then(
					// launch the stream
					this.launchLivestreamer.bind( this, livestreamer, true ),
					// show error message
					this.onStreamFailure.bind( this, livestreamer )
				);
		},

		onStreamSuccess: function( livestreamer, firstLaunch ) {
			set( livestreamer, "success", true );

			if ( !firstLaunch ) { return; }

			// setup stream refresh interval
			this.refreshStream( livestreamer );

			// automatically close modal on success
			if ( get( this, "settings.gui_hidestreampopup" ) ) {
				this.send( "close" );
			}

			// automatically open chat
			if ( get( livestreamer, "gui_openchat" ) ) {
				this.send( "chat", get( livestreamer, "channel" ) );
			}

			// hide the GUI
			this.minimize( false );
		},

		onStreamFailure: function( livestreamer, error ) {
			set( livestreamer, "error", true );
			set( this, "error", error || new Error( "Internal error" ) );

			this.clearLivestreamer( livestreamer );
		},

		onStreamShutdown: function( livestreamer ) {
			// close the modal only if there was no error and if it belongs to the stream
			if (
				   !get( livestreamer, "error" )
				&& get( this, "active" ) === livestreamer
			) {
				this.send( "close" );
			}

			// restore the GUI
			this.minimize( true );

			this.clearLivestreamer( livestreamer );
		},

		clearLivestreamer: function( livestreamer ) {
			// remove the livestreamer record from the store
			if ( !get( livestreamer, "isDeleted" ) ) {
				livestreamer.destroyRecord();
			}
		},


		/**
		 * Check the location of livestreamer and validate
		 * @returns {Promise}
		 */
		checkLivestreamer: function() {
			var path = get( this, "settings.livestreamer" );
			var exec = get( this, "metadata.config.livestreamer-exec" );
			var fb   = get( this, "metadata.config.livestreamer-fallback-paths-unix" );
			var livestreamer;

			path = String( path ).trim();

			// use the default command if the user did not define one
			if ( !path.length ) {
				livestreamer = exec;
			// otherwise check for containing executable name
			} else if ( path.indexOf( exec ) !== -1 ) {
				livestreamer = path;
			} else {
				return Promise.reject( new NotFoundError() );
			}

			// check for the executable
			return which( livestreamer, execCheck )
				// check fallback paths
				.catch(function() {
					var promise = Promise.reject();
					// ignore fallbacks if custom path has been set
					if ( path || isWin || !fb || !fb.length ) {
						return promise;
					}

					return fb.reduce(function( promise, path ) {
						var check = PATH.join( PATH.resolve( path ), exec );
						return promise.catch(function() {
							return stat( check, execCheck );
						});
					}, promise );
				}.bind( this ) )
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
			var minimum = get( this, "metadata.config.livestreamer-version-min" );
			var time    = get( this, "metadata.config.livestreamer-validation-timeout" );
			var spawn;

			function kill() {
				if ( spawn ) { spawn.kill( "SIGKILL" ); }
				spawn = null;
			}

			return new Promise(function( resolve, reject ) {
				spawn = CP.spawn( exec, [ "--version", "--no-version-check" ] );

				function onLine( line, idx, lines ) {
					// be strict: livestreamer's output is just one single line
					if ( idx !== 0 || lines.length !== 1 ) {
						reject( new Error( "Unexpected version check output" ) );
					}

					// match the version string
					var match = reVersion.exec( line );
					if ( match ) {
						resolve( match[1] );
					}
				}

				function onExit( code ) {
					// ignore code 0 (no error)
					if ( code === 0 ) { return; }
					reject( new Error( "Exit code " + code ) );
				}

				function onTimeout() {
					reject( new Error( "Timeout" ) );
				}

				// reject on error / exit
				spawn.on( "error", reject );
				spawn.on(  "exit", onExit );

				// read from stdout and stderr independently
				spawn.stdout.on( "data", new StreamOutputBuffer( onLine ) );
				spawn.stderr.on( "data", new StreamOutputBuffer( onLine ) );

				// kill after a certain time
				run.later( onTimeout, time );
			})
				.then(function( version ) {
					kill();
					return version === semver.getMax([ version, minimum ])
						? Promise.resolve( exec )
						: Promise.reject( new VersionError( version ) );

				}, function( err ) {
					kill();
					return Promise.reject( err );
				});
		},


		/**
		 * Launch the stream
		 * @returns {Promise}
		 */
		launchLivestreamer: function( livestreamer, firstLaunch, exec ) {
			// in case the shutdown button was pressed before
			if ( get( this, "abort" ) ) {
				this.clearLivestreamer( livestreamer );
				return Promise.reject();
			}

			livestreamer.clearLog();
			set( livestreamer, "success", false );
			set( livestreamer, "warning", false );
			set( this, "active", livestreamer );

			var defer     = Promise.defer();

			var channel   = get( livestreamer, "channel.id" );
			var quality   = get( livestreamer, "quality" );
			var streamURL = get( this, "metadata.config.twitch-stream-url" );
			var qualities = Settings.qualities;

			// get the livestreamer parameter list and append stream url and quality
			var params    = get( livestreamer, "parameters" );
			params.push( streamURL.replace( "{channel}", channel ) );
			params.push( ( qualities[ quality ] || qualities[ 0 ] ).quality );

			// spawn the livestreamer process
			var spawn = CP.spawn( exec, params, { detached: true } );
			set( livestreamer, "spawn", spawn );


			function onExit() {
				// clear up some memory
				set( livestreamer, "spawn", null );
				spawn = null;

				// quality has been changed
				var currentQuality = get( livestreamer, "quality" );
				if ( quality !== currentQuality ) {
					this.launchLivestreamer( livestreamer, false, exec );

					// stream has been shut down regularly
				} else {
					this.onStreamShutdown( livestreamer );
				}
			}

			function warnOrReject( line, error ) {
				livestreamer.pushLog( "stdErr", line );

				if ( error instanceof Warning ) {
					set( livestreamer, "warning", true );
				} else {
					defer.reject( error || new Error( line ) );
				}
			}

			// reject promise on any error output
			function onStdErr( line ) {
				var error = parseError( line );
				warnOrReject( line, error );
			}

			// fulfill promise as soon as livestreamer is launching the player
			function onStdOut( line ) {
				var error = parseError( line );
				if ( error ) {
					return warnOrReject( line, error );
				}

				line = line.replace( reReplace, "" );
				livestreamer.pushLog( "stdOut", line );

				if ( rePlayer.test( line ) ) {
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

			spawn.on( "error", defer.reject );
			spawn.on( "exit", onExit.bind( this ) );
			spawn.stdout.on( "data", new StreamOutputBuffer( onStdOut ) );
			spawn.stderr.on( "data", new StreamOutputBuffer( onStdErr ) );

			return defer.promise.then(
				this.onStreamSuccess.bind( this, livestreamer, firstLaunch ),
				this.onStreamFailure.bind( this, livestreamer )
			);
		},


		killAll: function() {
			/** @type {Array} */
			var model = get( this, "model" );
			model.slice().forEach(function( stream ) {
				stream.kill();
			});
		},

		minimize: function( restore ) {
			switch ( get( this, "settings.gui_minimize" ) ) {
				// minimize
				case 1:
					nwWindow.toggleMinimize( restore );
					break;
				// move to tray: toggle window and taskbar visibility
				case 2:
					nwWindow.toggleVisibility( restore );
					if ( get( this, "settings.isVisibleInTaskbar" ) ) {
						nwWindow.setShowInTaskbar( restore );
					}
					break;
			}
		},

		refreshStream: function( livestreamer ) {
			if ( get( livestreamer, "isDeleted" ) ) { return; }

			var interval = get( this, "metadata.config.stream-reload-interval" ) || 60000;

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
			"download": function( success ) {
				var url = get( this, "metadata.config.livestreamer-download-url" );
				this.send( "openBrowser", url );
				if ( success instanceof Function ) {
					success();
				}
			},

			"chat": function( channel ) {
				var chat = get( this, "chat" );
				chat.open( channel )
					.catch(function(){});
			},

			"abort": function() {
				set( this, "abort", true );
				this.send( "closeModal" );
			},

			"close": function() {
				this.send( "closeModal" );
				run.schedule( "destroy", this, function() {
					set( this, "active", null );
				});
			},

			"shutdown": function() {
				var active = get( this, "active" );
				if ( active ) {
					active.kill();
				}
				this.send( "close" );
			},

			"toggleLog": function() {
				var active = get( this, "active" );
				if ( active ) {
					active.toggleProperty( "showLog" );
				}
			}
		}
	});

});
