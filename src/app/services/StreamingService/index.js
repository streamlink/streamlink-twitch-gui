import {
	get,
	set,
	computed,
	inject,
	run,
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
	ExitSignalError,
	HostingError
} from "./errors";
import { clearCache } from "./cache";
import resolvePlayer from "./player/resolve";
import resolveProvider from "./provider/resolve";
import launch from "./launch";
import {
	setShowInTaskbar,
	setMinimized,
	setVisibility
} from "nwjs/Window";


const { service } = inject;
const { scheduleOnce } = run;
const { "stream-reload-interval": streamReloadInterval } = varsConfig;


const modelName = "stream";


function setIfNotNull( objA, objB, key ) {
	let val = get( objA, key );
	if ( val !== null ) {
		set( objB, key, val );
	}
}


export default Service.extend({
	chat: service(),
	modal: service(),
	settings: service(),
	store: service(),

	active: null,
	model: computed(function() {
		const store = get( this, "store" );
		return store.peekAll( modelName );
	}),


	init() {
		this._super( ...arguments );

		// invalidate cache: listen for all settings changes
		// changed properties of model relationships and nested attributes don't trigger isDirty
		get( this, "settings" ).on( "didUpdate", clearCache );
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
			this.onModalOpened( stream );

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

		this.onModalOpened( stream );

		// override record with channel specific settings
		await this.getChannelSettings( stream, quality );

		await this.launchStream( stream, true );
	},

	async launchStream( stream, launchChat ) {
		// begin the stream launch procedure
		try {
			set( this, "active", stream );

			await logDebug(
				"Preparing to launch stream",
				() => stream.toJSON({ includeId: true })
			);

			// resolve streaming provider
			const providerObj = await resolveProvider(
				stream,
				get( this, "settings.streamprovider" ),
				get( this, "settings.streamproviders" )
			);

			// resolve player
			const playerObj = await resolvePlayer(
				stream,
				get( this, "settings.player_preset" ),
				get( this, "settings.player" )
			);

			// launch the stream
			await launch(
				stream,
				providerObj,
				playerObj,
				() => this.onStreamSuccess( stream, launchChat )
			);

		} catch ( error ) {
			await this.onStreamFailure( stream, error );

		} finally {
			await this.onStreamEnd( stream );
		}
	},


	onStreamSuccess( stream, launchChat ) {
		if ( get( stream, "isWatching" ) ) {
			return;
		}
		set( stream, "isWatching", true );

		// setup stream refresh interval
		this.refreshStream( stream );

		// automatically close modal on success
		if ( get( this, "settings.gui_hidestreampopup" ) ) {
			this.closeStreamModal( stream );
		}

		// automatically open chat
		if (
			// do not open chat on stream restarts
			   launchChat
			// require open chat setting
			&& get( stream, "gui_openchat" )
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
		if ( error instanceof Aborted ) {
			return;
		}

		logError( error, () => stream.toJSON({ includeId: true }) );

		// clear cache on error
		if ( !( error instanceof HostingError ) ) {
			clearCache();
		}

		// show error in modal
		set( stream, "error", error );
	},

	onStreamEnd( stream ) {
		if ( get( this, "active" ) === stream ) {
			// close modal of the active stream if it has been enabled in the settings
			if ( get( this, "settings.gui_closestreampopup" ) ) {
				this.closeStreamModal( stream );
			}
		} else if ( !get( stream, "isDeleted" ) ) {
			const error = get( stream, "error" );
			// remove stream from store if modal is not opened
			if ( !error || error instanceof ExitSignalError ) {
				stream.destroyRecord();
			}
		}

		// restore the GUI
		this.minimize( true );
	},


	onModalOpened( stream ) {
		get( this, "modal" ).one( "close", () => {
			// unset the active property on the next tick (ModalDialogComponent.willDestroyElement)
			scheduleOnce( "destroy", () => {
				set( this, "active", null );

				// remove the record from the store
				if ( get( stream, "hasEnded" ) && !get( stream, "isDeleted" ) ) {
					stream.destroyRecord();
				}
			});
		});
	},

	closeStreamModal( stream ) {
		if ( get( this, "active" ) !== stream ) {
			return;
		}

		get( this, "modal" ).closeModal( this );
	},


	async getChannelSettings( stream, quality ) {
		const channel = get( stream, "channel" );
		const channelSettings = await channel.getChannelSettings();

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


	killAll() {
		/** @type {Stream[]} */
		const model = get( this, "model" );
		model.slice().forEach( stream => stream.kill() );
	},

	minimize( restore ) {
		switch ( get( this, "settings.gui_minimize" ) ) {
			// minimize
			case 1:
				setMinimized( !restore );
				break;
			// move to tray: toggle window and taskbar visibility
			case 2:
				setVisibility( restore );
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
