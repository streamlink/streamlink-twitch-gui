import {
	get,
	set,
	computed,
	inject,
	Service
} from "ember";
import {
	vars as varsConfig
} from "config";
import {
	logDebug,
	logError
} from "./logger";
import {
	Aborted,
	Warning
} from "./errors";
import parseError from "./parse-error";
import { providerCache } from "./cache";
import isAborted from "./is-aborted";
import spawn from "./spawn";
import resolveProvider from "./validation/resolve-provider";
import {
	setShowInTaskbar,
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


const { service } = inject;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;


const modelName = "stream";

const reReplace = /^\[(?:cli|plugin\.\w+)]\[\S+]\s+/;
const rePlayer = /^Starting player: \S+/;


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

	error: null,
	active: null,
	model: computed(function() {
		const store = get( this, "store" );
		return store.peekAll( modelName );
	}),


	init() {
		this._super( ...arguments );

		// invalidate cache: listen for all settings changes
		// changed properties of model relationships and nested attributes don't trigger isDirty
		get( this, "settings.content" ).on( "didUpdate", () => providerCache.clear() );
	},


	closeStream( twitchStream ) {
		const model = get( this, "model" );
		const stream = model.findBy( "stream", twitchStream );
		if ( !stream ) { return false; }
		stream.kill();
		return true;
	},

	async startStream( twitchStream, quality ) {
		get( this, "modal" ).openModal( "streaming", this, {
			error: null,
			active: null
		});

		const store = get( this, "store" );
		const channel = get( twitchStream, "channel" );
		const id = get( channel, "name" );
		let stream;

		// is the stream already running?
		if ( store.hasRecordForId( modelName, id ) ) {
			stream = store.recordForId( modelName, id );

			if ( quality !== undefined && get( stream, "quality" ) !== quality ) {
				set( stream, "quality", quality );
			}

			set( this, "active", stream );
			return;
		}

		// create a new Stream record
		stream = store.createRecord( modelName, {
			id,
			channel,
			stream: twitchStream,
			quality: get( this, "settings.quality" ),
			gui_openchat: get( this, "settings.gui_openchat" ),
			started: new Date()
		});

		// begin the stream launch procedure
		try {
			// override record with channel specific settings
			await this.getChannelSettings( stream, quality );

			await logDebug(
				"Preparing to launch stream",
				() => stream.toJSON({ includeId: true })
			);

			// get the exec command and validate
			const provider = await resolveProvider(
				stream,
				get( this, "settings.streamprovider" ),
				get( this, "settings.streamproviders" )
			);

			// launch the stream
			await this.launch( stream, provider, true );

		} catch ( err ) {
			if ( err instanceof Aborted ) {
				return;
			}
			// show error message
			this.onStreamFailure( stream, err );
		}
	},


	onStreamSuccess( stream, firstLaunch ) {
		set( stream, "success", true );

		if ( !firstLaunch ) { return; }

		// setup stream refresh interval
		this.refreshStream( stream );

		// automatically close modal on success
		if ( get( this, "settings.gui_hidestreampopup" ) ) {
			get( this, "modal" ).closeModal( this );
		}

		// automatically open chat
		if (
			// require open chat setting
			   get( stream, "gui_openchat" )
			&& (
				// context menu not used
				   !get( stream, "strictQuality" )
				// or context menu setting disabled
				|| !get( this, "settings.gui_openchat_context" )
			)
		) {
			const channel = get( stream, "channel" );
			const chat = get( this, "chat" );
			chat.open( channel )
				.catch( () => {} );
		}

		// hide the GUI
		this.minimize( false );
	},

	onStreamFailure( stream, error ) {
		if ( !error ) {
			error = new Error( "Internal error" );
		}

		set( stream, "error", true );
		set( this, "error", error );

		this.clear( stream );
		providerCache.clear();

		logError( error, () => stream.toJSON({ includeId: true }) );
	},

	onStreamShutdown( stream ) {
		// close the modal only if there was no error and if it belongs to the stream
		if (
			   !get( stream, "error" )
			&& get( this, "active" ) === stream
		) {
			get( this, "modal" ).closeModal( this );
		}

		// restore the GUI
		this.minimize( true );

		this.clear( stream );
	},

	clear( stream ) {
		// remove the record from the store
		if ( !get( stream, "isDeleted" ) ) {
			stream.destroyRecord();
		}
	},


	async getChannelSettings( stream, quality ) {
		const id = get( stream, "channel.name" );
		const channelSettings = await this.loadChannelSettings( id );

		// override channel specific settings
		if ( quality === undefined ) {
			setIfNotNull( channelSettings, stream, "quality" );
			set( stream, "strictQuality", false );
		} else {
			set( stream, "quality", quality );
			set( stream, "strictQuality", true );
		}
		setIfNotNull( channelSettings, stream, "gui_openchat" );
	},


	/**
	 * Run the executable and launch the stream
	 * @param {Stream} stream
	 * @param {ExecObj} execObj
	 * @param {Boolean} firstLaunch
	 * @returns {Promise}
	 */
	async launch( stream, execObj, firstLaunch ) {
		isAborted( stream );

		const params = await stream.getParameters();

		return new Promise( ( resolve, reject ) => {
			stream.clearLog();
			set( stream, "success", false );
			set( stream, "warning", false );
			set( this, "active", stream );

			const spawnQuality = get( stream, "quality" );

			// spawn the process
			let child = spawn( execObj, params, { detached: true } );
			set( stream, "spawn", child );


			function warnOrReject( line, error ) {
				stream.pushLog( "stdErr", line );

				if ( error instanceof Warning ) {
					set( stream, "warning", true );
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

				const error = parseError( line );
				if ( error ) {
					return warnOrReject( line, error );
				}

				stream.pushLog( "stdOut", line );

				if ( rePlayer.test( line ) ) {
					// wait for potential error messages to appear in stderr first before resolving
					setTimeout( resolve, 500 );
				}
			}

			child.on( "error", reject );
			child.on( "exit", code => {
				// clear up some memory
				set( stream, "spawn", null );
				child = null;

				// quality has been changed
				const currentQuality = get( stream, "quality" );
				if ( spawnQuality !== currentQuality ) {
					this.launch( stream, execObj, false );

				} else {
					if ( code !== 0 && !get( stream, "error" ) ) {
						this.onStreamFailure(
							stream,
							new Error( `The process exited with code ${code}` )
						);
					} else {
						this.onStreamShutdown( stream );
					}
				}
			});

			child.stdout.on( "data", new StreamOutputBuffer( onStdOut ) );
			child.stderr.on( "data", new StreamOutputBuffer( onStdErr ) );
		})
			.then(
				()    => this.onStreamSuccess( stream, firstLaunch ),
				error => this.onStreamFailure( stream, error )
			);
	},


	killAll() {
		/** @type {Stream[]} */
		const model = get( this, "model" );
		model.slice().forEach( stream => stream.kill() );
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

	refreshStream( stream ) {
		if ( get( stream, "isDeleted" ) ) {
			return;
		}

		const twitchStream = get( stream, "stream" );
		const reload = () => twitchStream.reload();
		let promise = Promise.reject();

		// try to reload the record at least 3 times
		for ( let i = 0; i < 3; i++ ) {
			promise = promise.catch( reload );
		}

		// queue another refresh
		promise.then( () => {
			setTimeout( () => this.refreshStream( stream ), streamReloadInterval );
		});
	}
});
