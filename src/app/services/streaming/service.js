import { set, computed } from "@ember/object";
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


function setIfNotNull( objA, keyA, objB, keyB ) {
	const val = objB[ keyB ];
	if ( val !== null ) {
		set( objA, keyA, val );
	}
}


export default Service.extend( /** @class StreamingService */ {
	/** @type {ChatService} */
	chat: service(),
	/** @type {ModalService} */
	modal: service(),
	/** @type {SettingsService} */
	settings: service(),
	/** @type {DS.Store} */
	store: service(),


	/** @type {DS.RecordArray<Stream>} */
	model: computed(function() {
		return this.store.peekAll( "stream" );
	}),

	hasStreams: computed( "model.@each.hasEnded", function() {
		return this.model.toArray().some( stream => !stream.hasEnded );
	}),


	init() {
		this._super( ...arguments );

		// invalidate cache: listen for all settings changes
		// changed properties of model relationships and nested attributes don't trigger isDirty
		this.settings.on( "didUpdate", clearCache );
	},


	/**
	 * @param {TwitchStream} twitchStream
	 * @return {boolean}
	 */
	closeStream( twitchStream ) {
		/** @type {Stream} */
		const stream = this.model.find( ({ stream }) => stream === twitchStream );
		if ( !stream ) { return false; }

		// remove from list if the stream has already ended (eg. with an error)
		// TODO: refactor this
		if ( !stream.isDeleted && stream.hasEnded ) {
			stream.destroyRecord();
		} else {
			stream.kill();
		}

		return true;
	},

	/**
	 * @param {TwitchStream} twitchStream
	 * @param {string?} quality
	 * @return {Promise}
	 */
	async startStream( twitchStream, quality ) {
		const { /** @type {DS.Store} */ store } = this;

		await twitchStream.user.promise;
		/** @type {TwitchUser} */
		const user = twitchStream.user.content;

		const { id } = user;
		/** @type {Stream} */
		let stream;

		// is the stream already running?
		if ( store.hasRecordForId( "stream", id ) ) {
			stream = store.peekRecord( "stream", id );

			if ( quality !== undefined && stream.quality !== quality ) {
				set( stream, "quality", quality );
			}

			// re-open modal streaming dialog of current stream
			this.modal.openModal( "streaming", stream );
			return;
		}

		// create a new Stream record
		stream = store.createRecord( "stream", {
			id,
			user,
			stream: twitchStream,
			quality: this.settings.content.streaming.quality,
			low_latency: this.settings.content.streaming.low_latency,
			disable_ads: this.settings.content.streaming.disable_ads,
			chat_open: this.settings.content.streams.chat_open,
			started: new Date()
		});

		// open modal streaming dialog with the newly created stream record as context
		this.modal.promiseModal( "streaming", stream )
			.then( () => {
				// clean up if the modal gets closed and the stream has ended
				if ( !stream.isDeleted && stream.hasEnded ) {
					stream.destroyRecord();
				}
			});

		// override record with channel specific settings
		await this.getChannelSettings( stream, quality );

		await this.launchStream( stream, true );
	},

	/**
	 * @param {Stream} stream
	 * @param {boolean} launchChat
	 * @return {Promise}
	 */
	async launchStream( stream, launchChat ) {
		// begin the stream launch procedure
		try {
			await logDebug(
				"Preparing to launch stream",
				() => stream.toJSON({ includeId: true })
			);

			const settingsStreaming = this.settings.content.streaming.toJSON();

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


	/**
	 * @param {Stream} stream
	 * @param {boolean} launchChat
	 */
	onStreamSuccess( stream, launchChat ) {
		if ( stream.isWatching ) { return; }
		set( stream, "isWatching", true );

		// setup stream refresh interval
		this.refreshStream( stream );

		// automatically close modal on success
		if ( this.settings.content.streams.modal_close_launch ) {
			this.modal.closeModal( stream );
		}

		// automatically open chat
		if (
			// do not open chat on stream restarts
			   launchChat
			// require open chat setting
			&& stream.chat_open
			&& (
				// context menu not used
				   !stream.strictQuality
				// or context menu setting disabled
				|| !this.settings.content.streams.chat_open_context
			)
		) {
			this.chat.openChat( stream.stream.user_login )
				.catch( () => {} );
		}

		// hide the GUI
		this.minimize( false );
	},

	/**
	 * @param {Stream} stream
	 * @param {Error} error
	 */
	onStreamFailure( stream, error ) {
		if ( error instanceof Aborted ) { return; }

		logError( error, () => stream.toJSON({ includeId: true }) );

		// clear cache on error
		if ( !( error instanceof HostingError ) ) {
			clearCache();
		}

		// show error in modal
		set( stream, "error", error );
	},

	/**
	 * @param {Stream} stream
	 */
	onStreamEnd( stream ) {
		const { error } = stream;

		// close modal of the stream if it has been enabled in the settings
		if ( !error && this.settings.content.streams.modal_close_end ) {
			this.modal.closeModal( stream );
		}

		// clean up if streams ends, but modal is not opened
		if ( !this.modal.hasModal( "streaming", stream ) && !stream.isDeleted ) {
			// remove stream from store if modal is not opened
			if ( !error || error instanceof ExitSignalError ) {
				stream.destroyRecord();
			}
		}

		// restore the GUI
		this.minimize( true );
	},


	/**
	 * @param {Stream} stream
	 * @param {string?} quality
	 * @return {Promise}
	 */
	async getChannelSettings( stream, quality ) {
		const channelSettings = await stream.stream.getChannelSettings();

		// override channel specific settings
		if ( quality === undefined ) {
			setIfNotNull( stream, "quality", channelSettings, "streaming_quality" );
			set( stream, "strictQuality", false );
		} else {
			set( stream, "quality", quality );
			set( stream, "strictQuality", true );
		}
		setIfNotNull( stream, "low_latency", channelSettings, "streaming_low_latency" );
		setIfNotNull( stream, "disable_ads", channelSettings, "streaming_disable_ads" );
		setIfNotNull( stream, "chat_open", channelSettings, "streams_chat_open" );
	},


	killAll() {
		this.model.slice().forEach( stream => stream.kill() );
	},

	minimize( restore ) {
		switch ( this.settings.content.gui.minimize ) {
			// minimize
			case ATTR_GUI_MINIMIZE_MINIMIZE:
				setMinimized( !restore );
				break;
			// move to tray: toggle window and taskbar visibility
			case ATTR_GUI_MINIMIZE_TRAY:
				setVisibility( restore );
				if ( this.settings.content.gui.isVisibleInTaskbar ) {
					setShowInTaskbar( restore );
				}
				break;
		}
	},

	/**
	 * @param {Stream} stream
	 * TODO: refactor this
	 */
	refreshStream( stream ) {
		if ( stream.isDestroyed || stream.isDeleted ) { return; }

		const { stream: twitchStream } = stream;
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
