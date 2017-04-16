import {
	get,
	set,
	makeArray,
	assign,
	computed,
	inject,
	run,
	Service
} from "ember";
import {
	streamprovider as streamproviderConfig,
	vars as varsConfig
} from "config";
import {
	setShowInTaskbar,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import Logger from "utils/Logger";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import {
	platform as platformName
} from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import readLines from "utils/node/fs/readLines";
import whichFallback from "utils/node/fs/whichFallback";
import { spawn } from "child_process";
import { watch } from "fs";
import { dirname } from "path";


const { hasOwnProperty } = {};
const { service } = inject;
const { later } = run;
const {
	providers,
	"version-min": versionMin,
	"validation-timeout": validationTimeout
} = streamproviderConfig;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;

const { logDebug, logError } = new Logger( "StreamingService" );

const modelName = "stream";

const reVersion   = /^(streamlink|livestreamer)(?:\.exe|-script\.py)? (\d+\.\d+.\d+)(?:$|\s.*)/i;
const reShebang   = /^#!(['"]?)(.+)\1\s*$/;
const reReplace   = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/;
const reUnable    = /^error: Unable to open URL: /;
const reNoStreams = /^error: No streams found on this URL: /;
const reHosting   = /^hosting was disabled by command line option$/;
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
	} else if ( reNoStreams.test( data ) || reHosting.exec( data ) ) {
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


class CacheItem {
	constructor( file, listener ) {
		this.file = file;
		this.watcher = watch( file, listener );
	}

	close() {
		this.watcher.close();
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

	/**
	 * Cache object with file watchers
	 * @type Object.<String,CacheItem>
	 */
	cache: {},
	setupCache( execObj ) {
		this.clearCache();
		Object.keys( execObj ).forEach( key => {
			if ( !execObj[ key ] ) { return; }
			this.cache[ key ] = new CacheItem( execObj[ key ], () => this.clearCache() );
		});
	},
	clearCache() {
		Object.keys( this.cache ).forEach( key =>
			this.cache[ key ].close()
		);
		this.cache = {};
	},


	init() {
		this._super( ...arguments );

		// invalidate cache: listen for all settings changes
		// changed properties of model relationships and nested attributes don't trigger isDirty
		get( this, "settings.content" ).on( "didUpdate", () => this.clearCache() );
	},


	async startStream( stream, quality ) {
		get( this, "modal" ).openModal( "streaming", this, {
			error : null,
			active: null,
			abort : false
		});

		let store   = get( this, "store" );
		let channel = get( stream, "channel" );
		let id      = get( channel, "name" );
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
		try {
			// override record with channel specific settings
			await this.getChannelSettings( record, quality );
			// get the exec command and validate
			const execObj = await this.check( record );
			// launch the stream
			await this.launch( record, true, execObj );

		} catch ( err ) {
			// show error message
			this.onStreamFailure( record, err );
		}
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
		if ( !error ) {
			error = new Error( "Internal error" );
		}

		set( record, "error", true );
		set( this, "error", error );

		this.clear( record );
		this.clearCache();

		return logError( error, () => record.toJSON({ includeId: true }) );
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
		let id = get( record, "channel.name" );

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

				return logDebug(
					"Preparing to launch stream",
					() => record.toJSON({ includeId: true })
				);
			});
	},


	/**
	 * Get the path of the executable and pythonscript
	 * @param {Stream} record
	 * @returns {Promise}
	 */
	async check( record ) {
		// read properties first (triggers observers)
		const settingsStreamprovider  = get( this, "settings.streamprovider" );
		const settingsStreamproviders = get( this, "settings.streamproviders" );

		// then check for already cached stream provider data
		const kCache = Object.keys( this.cache );
		if ( kCache.length ) {
			// only return paths
			return kCache.reduce( ( obj, key ) => {
				obj[ key ] = this.cache[ key ].file;
				return obj;
			}, {} );
		}

		// begin validation
		await logDebug( "Resolving streaming provider", {
			provider: settingsStreamprovider,
			config: settingsStreamproviders[ settingsStreamprovider ]
		});

		// check for known providers first
		if (
			   !hasOwnProperty.call( providers, settingsStreamprovider )
			|| !hasOwnProperty.call( settingsStreamproviders, settingsStreamprovider )
		) {
			throw new Error( "Invalid stream provider" );
		}

		// provider objects
		const providerCustom = settingsStreamproviders[ settingsStreamprovider ];
		const providerConfig = providers[ settingsStreamprovider ];
		const providerConfigFallback = providerConfig[ "fallback" ];
		const isPython = hasOwnProperty.call( providerConfig, "python" );

		// custom or default executable
		const providerCustomExec = providerCustom[ "exec" ];
		const providerExec = providerCustomExec || providerConfig[ "exec" ][ platformName ];
		if ( !providerExec ) {
			throw new Error( "Missing executable name for stream provider" );
		}

		// try to find the pythonscript
		let pythonscript;
		if ( isPython ) {
			try {
				const providerPythonscript = providerCustom[ "pythonscript" ]
					|| providerConfig[ "pythonscript" ][ platformName ];
				pythonscript = await whichFallback(
					providerPythonscript,
					providerConfig[ "pythonscriptfallback" ],
					isFile
				);
			} catch ( e ) {
				throw new NotFoundError( "Could not find Python script." );
			}
		}

		// try to find the executable
		let exec;
		try {
			try {
				// find the correct interpreter of the python script
				if ( isPython && !providerCustomExec ) {
					exec = await this.findPythonscriptInterpreter( providerExec, pythonscript );
				} else {
					// do the normal lookup in the catch block
					throw null;
				}
			} catch ( e ) {
				// find the exec with fallback paths if the provider is a standalone version
				// or if a custom exec has been set or if the shebang parsing method has failed
				exec = await whichFallback( providerExec, providerConfigFallback );
			}
		} catch ( e ) {
			const str = isPython ? "Python " : "";
			throw new NotFoundError( `Could not find ${str}executable.` );
		}

		const execObj = { exec, pythonscript };
		await logDebug( "Found streaming provider", execObj );

		return await this.validate( record, execObj );
	},

	/**
	 * @param {String} providerExec
	 * @param {String} pythonscript
	 * @returns {Promise.<String>}
	 */
	async findPythonscriptInterpreter( providerExec, pythonscript ) {
		const [ [ [ ,, shebang ] ] ] = await readLines( pythonscript, reShebang, 1 );
		const dir = dirname( shebang );

		// don't use the shebang directly: Windows uses a different python executable
		// look up the custom Windows executable in the returned dir
		return await whichFallback( providerExec, dir, null, true );
	},

	/**
	 * Validate
	 * Runs the executable/pythonscript with the `--version` parameter and reads answer from stderr
	 * @param {Stream} record
	 * @param {Object} execObj
	 * @param {String} execObj.exec
	 * @param {String} execObj.pythonscript
	 * @returns {Promise}
	 */
	async validate( record, execObj ) {
		// in case the shutdown button was pressed before
		if ( get( this, "abort" ) ) {
			this.clear( record );
			return;
		}

		const { exec, pythonscript } = execObj;
		let child;

		function kill() {
			if ( child ) { child.kill( "SIGKILL" ); }
			child = null;
		}

		return new Promise( ( resolve, reject ) => {
			const params = [ "--version", "--no-version-check" ];
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
					name = name.toLowerCase();
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
			.then( async ({ name, version }) => {
				if ( !versionMin.hasOwnProperty( name ) ) {
					throw new NotFoundError();
				}
				if ( version !== getMax([ version, versionMin[ name ] ]) ) {
					throw new VersionError( version );
				}

				await logDebug( "Validated streaming provider", { name, version } );
				this.setupCache( execObj );

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
	async getParameters( record, execObj ) {
		// in case the shutdown button was pressed before
		if ( get( this, "abort" ) ) {
			this.clear( record );
			return Promise.reject();
		}

		const params = await record.getParameters();
		const { exec, pythonscript } = execObj;

		if ( pythonscript ) {
			params.unshift( pythonscript );
		}

		const paramsObj = { exec, params };
		await logDebug( "Spawning streaming provider process", paramsObj );

		return paramsObj;
	},


	/**
	 * Run the executable and launch the stream
	 * @param {Stream} record
	 * @param {Boolean} firstLaunch
	 * @param {Object} execObj
	 * @param {String} execObj.exec
	 * @param {String} execObj.pythonscript
	 * @returns {Promise}
	 */
	async launch( record, firstLaunch, execObj ) {
		// in case the shutdown button was pressed before
		if ( get( this, "abort" ) ) {
			this.clear( record );
			return;
		}

		const { exec, params } = await this.getParameters( record, execObj );

		return new Promise( ( resolve, reject ) => {
			record.clearLog();
			set( record, "success", false );
			set( record, "warning", false );
			set( this, "active", record );

			let spawnQuality = get( record, "quality" );

			// spawn the process
			let child = spawn( exec, params, { detached: true } );
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
				line = line.replace( reReplace, "" );

				let error = parseError( line );
				warnOrReject( line, error );
			}

			// fulfill promise as soon as the player is launched
			function onStdOut( line ) {
				line = line.replace( reReplace, "" );

				let error = parseError( line );
				if ( error ) {
					return warnOrReject( line, error );
				}

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
					this.launch( record, false, execObj );

				} else {
					if ( code !== 0 ) {
						set( record, "error", true );
						set( this, "error", new Error( `The process exited with code ${code}` ) );
						logError(
							`The streaming provider processes exited with code ${code}`,
							() => {
								const log = get( record, "log" )
									.map( line => line.line );

								return {
									exec,
									params,
									log
								};
							}
						);
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
