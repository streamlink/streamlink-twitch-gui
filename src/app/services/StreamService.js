import {
	get,
	set,
	makeArray,
	assign,
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
import {
	setShowInTaskbar,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import {
	platform as platformName
} from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";
import { spawn } from "child_process";


const { service } = inject;
const { later } = run;
const {
	providers,
	"version-min": versionMin,
	"validation-timeout": validationTimeout
} = streamproviderConfig;
const { "stream-url": twitchStreamUrl } = twitchConfig;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;

const modelName = "stream";

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
// error messages get printed to stdout instead of stderr sometimes
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
		return store.peekAll( modelName );
	}),


	startStream( stream, quality ) {
		get( this, "modal" ).openModal( "stream", this, {
			error : null,
			active: null,
			abort : false
		});

		let store   = get( this, "store" );
		let channel = get( stream, "channel" );
		let id      = get( channel, "id" );
		let record;

		// is the stream already running?
		if ( store.hasRecordForId( modelName, id ) ) {
			record = store.recordForId( modelName, id );

			if ( quality !== undefined && get( record, "quality" ) !== quality ) {
				set( record, "quality", quality );
			}

			set( this, "active", record );
			return;
		}

		// create a new Stream record
		record = store.createRecord( modelName, {
			id,
			stream,
			channel,
			quality     : get( this, "settings.quality" ),
			gui_openchat: get( this, "settings.gui_openchat" ),
			started     : new Date()
		});

		// begin the stream launch procedure
		Promise.resolve()
			// override record with channel specific settings
			.then( () => this.getChannelSettings( record, quality ) )
			// get the exec command
			.then( () => this.check() )
			// validate configuration
			.then( execObj => this.validate( execObj ) )
			// build parameter array
			.then( execObj => this.getParameters( record, execObj ) )
			.then(
				// launch the stream
				params => this.launch( record, true, params ),
				// show error message
				error => this.onStreamFailure( record, error )
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


	closeStream( twitchStream ) {
		let model = get( this, "model" );
		let record = model.findBy( "stream", twitchStream );
		if ( !record ) { return false; }
		record.kill();
		return true;
	},


	getChannelSettings( record, quality ) {
		let id = get( record, "channel.id" );

		return this.loadChannelSettings( id )
			// override channel specific settings
			.then( settings => {
				if ( quality === undefined ) {
					setIfNotNull( settings, record, "quality" );
					set( record, "strictQuality", false );
				} else {
					set( record, "quality", quality );
					set( record, "strictQuality", true );
				}
				setIfNotNull( settings, record, "gui_openchat" );
			});
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

				return { exec, pythonscript: null };

			// not found
			}, function() {
				let str = isPython ? "Python " : "";
				throw new NotFoundError( `Could not find ${str}executable.` );
			});
	},

	/**
	 * Validate
	 * Runs the executable/pythonscript with the `--version` parameter and reads answer from stderr
	 * @param {Object} execObj
	 * @param {String} execObj.exec
	 * @param {String} execObj.pythonscript
	 * @returns {Promise}
	 */
	validate( execObj ) {
		let { exec, pythonscript } = execObj;
		let child;

		function kill() {
			if ( child ) { child.kill( "SIGKILL" ); }
			child = null;
		}

		return new Promise(function( resolve, reject ) {
			let params = [ "--version", "--no-version-check" ];
			if ( pythonscript ) {
				params.unshift( pythonscript );
			}

			child = spawn( exec, params );

			function onLine( line, idx, lines ) {
				// be strict: output is just one single line
				if ( idx !== 0 || lines.length !== 1 ) {
					reject( new ErrorLog( "Unexpected version check output", lines ) );
					return;
				}

				// match the version string
				let match = reVersion.exec( line );
				if ( match ) {
					let [ , name, version ] = match;
					resolve({ name, version });
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
			child.on( "error", reject );
			child.on(  "exit", onExit );

			// read from stdout and stderr independently
			child.stdout.on( "data", new StreamOutputBuffer( onLine ) );
			child.stderr.on( "data", new StreamOutputBuffer( onLine ) );

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

				return execObj;
			});
	},

	/**
	 * Get the parameter list
	 * @param {Stream} record
	 * @param {Object} execObj
	 * @param {String} execObj.exec
	 * @param {String} execObj.pythonscript
	 * @returns {Promise}
	 */
	getParameters: function( record, execObj ) {
		return record.getParameters()
			.then(function( params ) {
				let { exec, pythonscript } = execObj;

				if ( pythonscript ) {
					params.unshift( pythonscript );
				}

				return { exec, params };
			});
	},


	/**
	 * Run the executable and launch the stream
	 * @param {Stream} record
	 * @param {Boolean} firstLaunch
	 * @param {Object} paramsObj
	 * @param {String} paramsObj.exec
	 * @param {String[]} paramsObj.params
	 * @returns {Promise}
	 */
	launch( record, firstLaunch, paramsObj ) {
		// in case the shutdown button was pressed before
		if ( get( this, "abort" ) ) {
			this.clear( record );
			return Promise.reject();
		}

		return new Promise( ( resolve, reject ) => {
			record.clearLog();
			set( record, "success", false );
			set( record, "warning", false );
			set( this, "active", record );

			let { exec, params } = paramsObj;
			let spawnQuality = get( record, "quality" );

			let parameters = [
				...params,
				twitchStreamUrl.replace( "{channel}", get( record, "channel.id" ) ),
				get( record, "streamquality" )
			];

			// spawn the process
			let child = spawn( exec, parameters, { detached: true } );
			set( record, "spawn", child );


			function warnOrReject( line, error ) {
				record.pushLog( "stdErr", line );

				if ( error instanceof Warning ) {
					set( record, "warning", true );
				} else {
					reject( error || new Error( line ) );
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
					// wait for potential error messages to appear in stderr first before resolving
					later( resolve, 500 );
				}
			}

			child.on( "error", reject );
			child.on( "exit", code => {
				// clear up some memory
				set( record, "spawn", null );
				child = null;

				// quality has been changed
				let currentQuality = get( record, "quality" );
				if ( spawnQuality !== currentQuality ) {
					this.launch( record, false, paramsObj );

				} else {
					if ( code !== 0 ) {
						set( record, "error", true );
						set( this, "error", new Error( `The process exited with code ${code}` ) );
					}
					this.onStreamShutdown( record );
				}
			});

			child.stdout.on( "data", new StreamOutputBuffer( onStdOut ) );
			child.stderr.on( "data", new StreamOutputBuffer( onStdErr ) );
		})
			.then(
				()    => this.onStreamSuccess( record, firstLaunch ),
				error => this.onStreamFailure( record, error )
			);
	},


	killAll() {
		/** @type {Stream[]} */
		let record = get( this, "model" );
		record.slice().forEach(function( stream ) {
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

	refreshStream( record ) {
		if ( get( record, "isDeleted" ) ) { return; }

		let stream  = get( record, "stream" );
		let reload  = () => stream.reload();
		let promise = Promise.reject();

		// try to reload the record at least 3 times
		for ( let i = 0; i < 3; i++ ) {
			promise = promise.catch( reload );
		}

		// queue another refresh
		promise.then( () => later( () => this.refreshStream( record ), streamReloadInterval ) );
	},

	openChat( channel ) {
		let chat = get( this, "chat" );
		chat.open( channel )
			.catch(function() {});
	}
});
