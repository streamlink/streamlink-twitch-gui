import { get, set, computed } from "@ember/object";
import { scheduleOnce } from "@ember/runloop";
import { default as Service, inject as service } from "@ember/service";
import { vars as varsConfig } from "config";
import { logDebug, logError } from "./logger";
import { Aborted, ExitSignalError, HostingError } from "./errors";
import { clearCache } from "./cache";
import resolvePlayer from "./player/resolve";
import resolveProvider from "./provider/resolve";
import launch from "./launch";
import { setShowInTaskbar, setMinimized, setVisibility } from "nwjs/Window";
import {
	ATTR_GUI_MINIMIZE_MINIMIZE,
	ATTR_GUI_MINIMIZE_TRAY
} from "data/models/settings/gui/fragment";


const { "stream-reload-interval": streamReloadInterval } = varsConfig;


const modelName = "stream";


function setIfNotNull( objA, keyA, objB, keyB ) {
	const val = get( objB, keyB );
	if ( val !== null ) {
		set( objA, keyA, val );
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
			quality: get( this, "settings.streaming.quality" ),
			chat_open: get( this, "settings.streams.chat_open" ),
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

			const settingsStreaming = get( this, "settings.streaming" ).toJSON();

			// resolve streaming provider
			const providerObj = await resolveProvider(
				stream,
				settingsStreaming.provider,
				settingsStreaming.providers
			);

			// resolve player
			const playerObj = await resolvePlayer(
				stream,
				settingsStreaming.player,
				settingsStreaming.players
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
		if ( get( this, "settings.streams.modal_close_launch" ) ) {
			this.closeStreamModal( stream );
		}

		// automatically open chat
		if (
			// do not open chat on stream restarts
			   launchChat
			// require open chat setting
			&& get( stream, "chat_open" )
			&& (
				// context menu not used
				   !get( stream, "strictQuality" )
				// or context menu setting disabled
				|| !get( this, "settings.streams.chat_open_context" )
			)
		) {
			const channel = get( stream, "channel" );
			const chat = get( this, "chat" );
			chat.openChat( channel )
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
			if ( get( this, "settings.streams.modal_close_end" ) ) {
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
			setIfNotNull( stream, "quality", channelSettings, "streaming_quality" );
			set( stream, "strictQuality", false );
		} else {
			set( stream, "quality", quality );
			set( stream, "strictQuality", true );
		}
		setIfNotNull( stream, "chat_open", channelSettings, "streams_chat_open" );
	},


	killAll() {
		/** @type {Stream[]} */
		const model = get( this, "model" );
		model.slice().forEach( stream => stream.kill() );
	},

	minimize( restore ) {
		switch ( get( this, "settings.gui.minimize" ) ) {
			// minimize
			case ATTR_GUI_MINIMIZE_MINIMIZE:
				setMinimized( !restore );
				break;
			// move to tray: toggle window and taskbar visibility
			case ATTR_GUI_MINIMIZE_TRAY:
				setVisibility( restore );
				if ( get( this, "settings.gui.isVisibleInTaskbar" ) ) {
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
