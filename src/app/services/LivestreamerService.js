import {
	get,
	set,
	makeArray,
	assign,
	RSVP,
	computed,
	inject,
	run,
	Service
} from "Ember";
import {
	streamprovider as streamproviderConfig,
	twitch as twitchConfig,
	vars as varsConfig
} from "config";
import nwWindow from "nwjs/nwWindow";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import {
	platform as platformName
} from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";
import CP from "child_process";


const { service } = inject;
const { later } = run;
const {
	providers,
	"version-min": versionMin,
	"validation-timeout": validationTimeout
} = streamproviderConfig;
const { "stream-url": twitchStreamUrl } = twitchConfig;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;

const reVersion   = /^(livestreamer|streamlink)(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(?:.*)$/;
const reReplace   = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/;
const reUnable    = /^error: Unable to open URL: /;
const reNoStreams = /^error: No streams found on this URL: /;
const reNoPlayer  = /^error: Failed to start player: /;
const reNoPlayer2 = /^error: The default player \(.+\) does not seem to be installed\./;
const reWarnInsec = /InsecurePlatformWarning: A true SSLContext object is not available\./;
const rePlayer    = /^Starting player: \S+/;


function ErrorLog( message, log ) {
	let type = "stdErr";
	this.message = message;
	this.log = makeArray( log ).map(function( line ) {
		return { type, line };
	});
}
ErrorLog.prototype = assign( new Error(), { name: "ErrorLog" });

function VersionError( version ) { this.version = version; }
VersionError.prototype = assign( new Error(), { name: "VersionError" });

function NotFoundError( message ) { this.message = message; }
NotFoundError.prototype = assign( new Error(), { name: "NotFoundError" });

function UnableToOpenError() {}
UnableToOpenError.prototype = assign( new Error(), { name: "UnableToOpenError" });

function NoStreamsFoundError() {}
NoStreamsFoundError.prototype = assign( new Error(), { name: "NoStreamsFoundError" });

function NoPlayerError() {}
NoPlayerError.prototype = assign( new Error(), { name: "NoPlayerError" });

function Warning( message ) { this.message = message; }
Warning.prototype = assign( new Error(), { name: "Warning" } );


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
	let val = get( objA, key );
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
	model : computed(function() {
		let store = get( this, "store" );
		return store.peekAll( "livestreamer" );
	}),


	startStream( stream, quality ) {
		get( this, "modal" ).openModal( "livestreamer", this, {
			error : null,
			active: null,
			abort : false
		});

		let store   = get( this, "store" );
		let channel = get( stream, "channel" );
		let id      = get( channel, "id" );
		let record;

		// is the stream already running?
		if ( store.hasRecordForId( "livestreamer", id ) ) {
			record = store.recordForId( "livestreamer", id );

			if ( quality !== undefined && get( record, "quality" ) !== quality ) {
				set( record, "quality", quality );
			}

			set( this, "active", record );
			return;
		}

		// create a new livestreamer object
		record = store.createRecord( "livestreamer", {
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
					setIfNotNull( settings, record, "quality" );
					set( record, "strictQuality", false );
				} else {
					set( record, "quality", quality );
					set( record, "strictQuality", true );
				}
				setIfNotNull( settings, record, "gui_openchat" );
			})
			// get the exec command
			.then( this.check.bind( this ) )
			// and validate configuration
			.then( this.validate.bind( this ) )
			.then( this.getParameters.bind( this, record ) )
			.then(
				// launch the stream
				this.launch.bind( this, record, true ),
				// show error message
				this.onStreamFailure.bind( this, record )
			);
	},

	onStreamSuccess( record, firstLaunch ) {
		set( record, "success", true );

		if ( !firstLaunch ) { return; }

		// setup stream refresh interval
		this.refreshStream( record );

		// automatically close modal on success
		if ( get( this, "settings.gui_hidestreampopup" ) ) {
			get( this, "modal" ).closeModal( this );
		}

		// automatically open chat
		if (
			// require open chat setting
			   get( record, "gui_openchat" )
			&& (
				// context menu not used
				   !get( record, "strictQuality" )
				// or context menu setting disabled
				|| !get( this, "settings.gui_openchat_context" )
			)
		) {
			this.openChat( get( record, "channel" ) );
		}

		// hide the GUI
		this.minimize( false );
	},

	onStreamFailure( record, error ) {
		set( record, "error", true );
		set( this, "error", error || new Error( "Internal error" ) );

		this.clear( record );
	},

	onStreamShutdown( record ) {
		// close the modal only if there was no error and if it belongs to the stream
		if (
			   !get( record, "error" )
			&& get( this, "active" ) === record
		) {
			get( this, "modal" ).closeModal( this );
		}

		// restore the GUI
		this.minimize( true );

		this.clear( record );
	},

	clear( record ) {
		// remove the record from the store
		if ( !get( record, "isDeleted" ) ) {
			record.destroyRecord();
		}
	},


	closeStream( stream ) {
		let model = get( this, "model" );
		let record = model.findBy( "stream", stream );
		if ( !record ) { return false; }
		record.kill();
		return true;
	},


	/**
	 * Get the path of the executable and pythonscript
	 * @returns {Promise}
	 */
	check() {
		let streamprovider  = get( this, "settings.streamprovider" );
		let streamproviders = get( this, "settings.streamproviders" );

		if (
			   !providers.hasOwnProperty( streamprovider )
			|| !streamproviders.hasOwnProperty( streamprovider )
		) {
			return Promise.reject( new Error( "Invalid stream provider" ) );
		}

		// provider objects
		let providerCustom = streamproviders[ streamprovider ];
		let providerConfig = providers[ streamprovider ];
		let isPython = providerConfig.hasOwnProperty( "python" );

		// custom or default executable
		let exec = get( providerCustom, "exec" )
			|| providerConfig[ "exec" ][ platformName ];
		if ( !exec ) {
			return Promise.reject( new Error( "Missing executable name for stream provider" ) );
		}

		// try to find the executable
		return whichFallback(
			exec,
			providerConfig[ "fallback" ]
		)
			.then(function( exec ) {
				// try to find the pythonscript
				if ( isPython ) {
					let pythonscript = get( providerCustom, "pythonscript" )
						|| providerConfig[ "pythonscript" ][ platformName ];

					return whichFallback(
						pythonscript,
						providerConfig[ "pythonscriptfallback" ],
						isFile
					)
						.then(function( pythonscript ) {
							return { exec, pythonscript };
						}, function() {
							throw new NotFoundError( "Could not find Python script." );
						});
				}

				return { exec };

			// not found
			}, function() {
				throw new NotFoundError( `Could not find ${isPython ? "Python " : ""}executable.` );
			});
	},

	/**
	 * Validate
	 * Runs the executable/pythonscript with the `--version` parameter and reads answer from stderr
	 * @param {Object} exec
	 * @param {String} exec.exec
	 * @param {String?} exec.pythonscript
	 * @returns {Promise}
	 */
	validate( exec ) {
		let spawn;

		function kill() {
			if ( spawn ) { spawn.kill( "SIGKILL" ); }
			spawn = null;
		}

		return new RSVP.Promise(function( resolve, reject ) {
			let parameters = [ "--version", "--no-version-check" ];
			if ( exec.pythonscript ) {
				parameters.unshift( exec.pythonscript );
			}

			spawn = CP.spawn( exec.exec, parameters );

			function onLine( line, idx, lines ) {
				// be strict: livestreamer's output is just one single line
				if ( idx !== 0 || lines.length !== 1 ) {
					reject( new ErrorLog( "Unexpected version check output", lines ) );
					return;
				}

				// match the version string
				let match = reVersion.exec( line );
				if ( match ) {
					resolve({
						name: match[1],
						version: match[2]
					});
				} else {
					reject( new Error( "Invalid version check output" ) );
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
			later( onTimeout, validationTimeout );
		})
			.finally( kill )
			.then(function({ name, version }) {
				if ( !versionMin.hasOwnProperty( name ) ) {
					throw new NotFoundError();
				}

				if ( version !== getMax([ version, versionMin[ name ] ]) ) {
					throw new VersionError( version );
				}

				return exec;
			});
	},


	/**
	 * Get the parameter list
	 * @param {Livestreamer} record
	 * @param {Object} exec
	 * @returns {Promise}
	 */
	getParameters: function( record, exec ) {
		return record.getParameters()
			.then(function( params ) {
				if ( exec.pythonscript ) {
					params.unshift( exec.pythonscript );
				}

				return [ exec, params ];
			});
	},


	/**
	 * Run the executable and launch the stream
	 * @param {Livestreamer} record
	 * @param {Boolean} firstLaunch
	 * @param {Object} exec
	 * @param {String} exec.exec
	 * @param {String?} exec.pythonscript
	 * @param {String[]} params
	 * @returns {Promise}
	 */
	launch( record, firstLaunch, [ exec, params ] ) {
		// in case the shutdown button was pressed before
		if ( get( this, "abort" ) ) {
			this.clear( record );
			return Promise.reject();
		}

		let defer = RSVP.defer();

		record.clearLog();
		set( record, "success", false );
		set( record, "warning", false );
		set( this, "active", record );

		let spawnQuality = get( record, "quality" );

		let parameters = [
			...params,
			twitchStreamUrl.replace( "{channel}", get( record, "channel.id" ) ),
			get( record, "streamquality" )
		];

		// spawn the process
		let spawn = CP.spawn( exec.exec, parameters, { detached: true } );
		set( record, "spawn", spawn );


		function onExit( code ) {
			// clear up some memory
			set( record, "spawn", null );
			spawn = null;

			// quality has been changed
			let currentQuality = get( record, "quality" );
			if ( spawnQuality !== currentQuality ) {
				this.launch( record, false, [ exec, params ] );

			} else {
				if ( code !== 0 ) {
					set( record, "error", true );
					set( this, "error", new Error( `The process exited with code ${code}` ) );
				}
				this.onStreamShutdown( record );
			}
		}

		function warnOrReject( line, error ) {
			record.pushLog( "stdErr", line );

			if ( error instanceof Warning ) {
				set( record, "warning", true );
			} else {
				defer.reject( error || new Error( line ) );
			}
		}

		// reject promise on any error output
		function onStdErr( line ) {
			let error = parseError( line );
			warnOrReject( line, error );
		}

		// fulfill promise as soon as the player is launched
		function onStdOut( line ) {
			let error = parseError( line );
			if ( error ) {
				return warnOrReject( line, error );
			}

			line = line.replace( reReplace, "" );
			record.pushLog( "stdOut", line );

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
			this.onStreamSuccess.bind( this, record, firstLaunch ),
			this.onStreamFailure.bind( this, record )
		);
	},


	killAll() {
		/** @type {Livestreamer[]} */
		let record = get( this, "model" );
		record.slice().forEach(function( stream ) {
			stream.kill();
		});
	},

	minimize( restore ) {
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

	refreshStream( record ) {
		if ( get( record, "isDeleted" ) ) { return; }

		let stream  = get( record, "stream" );
		let reload  = stream.reload.bind( stream );
		let promise = reload();

		// try to reload the record at least 3 times
		for ( let i = 1; i < 3; i++ ) {
			promise = promise.catch( reload );
		}

		// queue another refresh
		promise.then(function() {
			later( this, this.refreshStream, record, streamReloadInterval );
		}.bind( this ) );
	},

	openChat( channel ) {
		let chat = get( this, "chat" );
		chat.open( channel )
			.catch(function() {});
	}
});
