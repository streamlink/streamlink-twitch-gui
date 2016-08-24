import {
	get,
	set,
	makeArray,
	merge,
	inject,
	run,
	Service
} from "Ember";
import {
	livestreamer as livestreamerConfig,
	twitch as twitchConfig,
	vars as varsConfig
} from "config";
import {
	setShowInTaskbar,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import Settings from "models/localstorage/Settings";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import whichFallback from "utils/node/fs/whichFallback";
import CP from "child_process";


const { service } = inject;
const { later } = run;
const {
	"exec": livestreamerExec,
	"fallback": livestreamerFallback,
	"version-min": livestreamerVersionMin,
	"validation-timeout": livestreamerTimeout
} = livestreamerConfig;
const { "stream-url": twitchStreamUrl } = twitchConfig;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;

const reVersion   = /^livestreamer(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(.*)$/;
const reReplace   = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/;
const reUnable    = /^error: Unable to open URL: /;
const reNoStreams = /^error: No streams found on this URL: /;
const reNoPlayer  = /^error: Failed to start player: /;
const reNoPlayer2 = /^error: The default player \(.+\) does not seem to be installed\./;
const reWarnInsec = /InsecurePlatformWarning: A true SSLContext object is not available\./;
const rePlayer    = /^Starting player: \S+/;


function ErrorLog( message, log ) {
	var type = "stdErr";
	this.message = message;
	this.log = makeArray( log ).map(function( line ) {
		return { type, line };
	});
}
ErrorLog.prototype = merge( new Error(), { name: "ErrorLog" });

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


export default Service.extend( ChannelSettingsMixin, {
	chat: service(),
	modal: service(),
	settings: service(),
	store: service(),

	error : null,
	active: null,
	abort : false,
	model : function() {
		var store = get( this, "store" );
		return store.peekAll( "livestreamer" );
	}.property(),


	startStream( stream, quality ) {
		get( this, "modal" ).openModal( "livestreamer", this, {
			error : null,
			active: null,
			abort : false
		});

		var store   = get( this, "store" );
		var channel = get( stream, "channel" );
		var id      = get( channel, "id" );
		var livestreamer;

		// is the stream already running?
		if ( store.hasRecordForId( "livestreamer", id ) ) {
			livestreamer = store.recordForId( "livestreamer", id );

			if ( quality !== undefined && get( livestreamer, "quality" ) !== quality ) {
				set( livestreamer, "quality", quality );
			}

			set( this, "active", livestreamer );
			return;
		}

		// create a new livestreamer object
		livestreamer = store.createRecord( "livestreamer", {
			id,
			stream,
			channel,
			quality     : get( this, "settings.quality" ),
			gui_openchat: get( this, "settings.gui_openchat" ),
			started     : new Date()
		});

		this.loadChannelSettings( id )
			// override channel specific settings
			.then(function( settings ) {
				if ( quality === undefined ) {
					setIfNotNull( settings, livestreamer, "quality" );
					set( livestreamer, "strictQuality", false );
				} else {
					set( livestreamer, "quality", quality );
					set( livestreamer, "strictQuality", true );
				}
				setIfNotNull( settings, livestreamer, "gui_openchat" );
			})
			// get the exec command
			.then( this.checkLivestreamer.bind( this ) )
			// and validate configuration
			.then( this.validateLivestreamer.bind( this ) )
			.then(
				// launch the stream
				this.launchLivestreamer.bind( this, livestreamer, true ),
				// show error message
				this.onStreamFailure.bind( this, livestreamer )
			);
	},

	onStreamSuccess( livestreamer, firstLaunch ) {
		set( livestreamer, "success", true );

		if ( !firstLaunch ) { return; }

		// setup stream refresh interval
		this.refreshStream( livestreamer );

		// automatically close modal on success
		if ( get( this, "settings.gui_hidestreampopup" ) ) {
			get( this, "modal" ).closeModal( this );
		}

		// automatically open chat
		if (
			// require open chat setting
			   get( livestreamer, "gui_openchat" )
			&& (
				// context menu not used
				   !get( livestreamer, "strictQuality" )
				// or context menu setting disabled
				|| !get( this, "settings.gui_openchat_context" )
			)
		) {
			this.openChat( get( livestreamer, "channel" ) );
		}

		// hide the GUI
		this.minimize( false );
	},

	onStreamFailure( livestreamer, error ) {
		set( livestreamer, "error", true );
		set( this, "error", error || new Error( "Internal error" ) );

		this.clearLivestreamer( livestreamer );
	},

	onStreamShutdown( livestreamer ) {
		// close the modal only if there was no error and if it belongs to the stream
		if (
			   !get( livestreamer, "error" )
			&& get( this, "active" ) === livestreamer
		) {
			get( this, "modal" ).closeModal( this );
		}

		// restore the GUI
		this.minimize( true );

		this.clearLivestreamer( livestreamer );
	},

	clearLivestreamer( livestreamer ) {
		// remove the livestreamer record from the store
		if ( !get( livestreamer, "isDeleted" ) ) {
			livestreamer.destroyRecord();
		}
	},


	closeStream( stream ) {
		var model = get( this, "model" );
		var livestreamer = model.findBy( "stream", stream );
		if ( !livestreamer ) { return false; }
		livestreamer.kill();
		return true;
	},


	/**
	 * Check the location of livestreamer and validate
	 * @returns {Promise}
	 */
	checkLivestreamer() {
		var customExec = String( get( this, "settings.livestreamer" ) ).trim();

		// check for the executable
		return whichFallback(
			// use the default command if the user did not define a custom one
			customExec.length
				? customExec
				: livestreamerExec,
			// ignore fallbacks if custom path has been set
			customExec
				? null
				: livestreamerFallback
		)
			// not found
			.catch(function() { throw new NotFoundError(); });
	},

	/**
	 * Validate livestreamer
	 * Runs the executable with `--version` parameters and reads answer from stderr
	 * @param {string} exec
	 * @returns {Promise}
	 */
	validateLivestreamer( exec ) {
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
					reject( new ErrorLog( "Unexpected version check output", lines ) );
					return;
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
				reject( new Error( `Exit code ${code}` ) );
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
			later( onTimeout, livestreamerTimeout );
		})
			.then(function( version ) {
				kill();
				return version === getMax([ version, livestreamerVersionMin ])
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
	launchLivestreamer( livestreamer, firstLaunch, exec ) {
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
		var qualities = Settings.qualities;

		// get the livestreamer parameter list and append stream url and quality
		var params    = get( livestreamer, "parameters" );
		params.push( twitchStreamUrl.replace( "{channel}", channel ) );
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
				later( defer, defer.resolve, 500 );
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


	killAll() {
		/** @type {Array} */
		var model = get( this, "model" );
		model.slice().forEach(function( stream ) {
			stream.kill();
		});
	},

	minimize( restore ) {
		switch ( get( this, "settings.gui_minimize" ) ) {
			// minimize
			case 1:
				toggleMinimize( restore );
				break;
			// move to tray: toggle window and taskbar visibility
			case 2:
				toggleVisibility( restore );
				if ( get( this, "settings.isVisibleInTaskbar" ) ) {
					setShowInTaskbar( restore );
				}
				break;
		}
	},

	refreshStream( livestreamer ) {
		if ( get( livestreamer, "isDeleted" ) ) { return; }

		var stream  = get( livestreamer, "stream" );
		var reload  = stream.reload.bind( stream );
		var promise = reload();

		// try to reload the record at least 3 times
		for ( var i = 1; i < 3; i++ ) {
			promise = promise.catch( reload );
		}

		// queue another refresh
		promise.then(function() {
			later( this, this.refreshStream, livestreamer, streamReloadInterval );
		}.bind( this ) );
	},

	openChat( channel ) {
		var chat = get( this, "chat" );
		chat.open( channel )
			.catch(function() {});
	}
});
