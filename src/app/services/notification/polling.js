import { A } from "@ember/array";
import { set, setProperties, observer } from "@ember/object";
import Evented from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import { notification as notificationConfig } from "config";
import { cacheClear, cacheFill } from "./cache";
import { iconDirCreate, iconDirClear } from "./icons";
import { logError } from "./logger";
import { setTimeout, clearTimeout } from "timers";


const {
	fails: {
		requests: failsRequests
	},
	interval: {
		request: intervalSuccess,
		retry: intervalRetry,
		error: intervalError
	},
	query: {
		first,
		maxQueries
	}
} = notificationConfig;


// TODO: rewrite this as a generic PollingService with a better design and better tests
export default Mixin.create( Evented, /** @class NotificatonServicePollingMixin */ {
	/** @type {AuthService} */
	auth: service(),
	/** @type {SettingsService} */
	settings: service(),
	/** @type {DS.Store} */
	store: service(),

	// NotificationService properties
	running: false,
	error: false,

	// state
	_pollNext: null,
	_pollTries: 0,
	_pollInitialized: false,
	_pollPromise: null,


	_pollObserver: observer( "running", function() {
		if ( this.running ) {
			this._pollPromise = this.start();
		} else {
			this.reset();
		}
	}),


	reset() {
		// unqueue
		if ( this._pollNext ) {
			clearTimeout( this._pollNext );
		}

		// reset state
		cacheClear();
		setProperties( this, {
			error: false,
			_pollNext: null,
			_pollTries: 0
		});
	},

	async start() {
		try {
			// reset before starting (again)
			this.reset();

			// wait for initialization to complete
			if ( !this._pollInitialized ) {
				await iconDirCreate();
				await iconDirClear();
				this._pollInitialized = true;
			}

			// start polling
			await this._poll( true );

		} catch ( e ) {
			await logError( e );
		}
	},

	/**
	 * @param {boolean?} firstRun
	 * @returns {Promise}
	 */
	async _poll( firstRun ) {
		if ( !this.running ) { return; }

		let streams;
		try {
			// get all followed streams
			streams = await this._pollQuery();
		} catch ( e ) {
			// requeue on query failures
			return this._pollFailure();
		}

		if ( !this.running ) { return; }
		await this._pollResult( streams, firstRun );

		// requeue
		this._pollSuccess();
	},

	_pollSuccess() {
		setProperties( this, {
			error: false,
			_pollTries: 0
		});
		this._pollRequeue( intervalSuccess );
	},

	_pollFailure() {
		let tries = this._pollTries;

		// did we reach the retry limit yet?
		if ( ++tries > failsRequests ) {
			// reset state
			this.reset();
			// let the user know that there was an error...
			set( this, "error", true );
			// ...but keep going
			this._pollRequeue( intervalError );

		} else {
			set( this, "_pollTries", tries );
			// immediately retry (with a slight delay)
			this._pollRequeue( intervalRetry );
		}
	},

	_pollRequeue( time ) {
		if ( !this.running ) { return; }

		this._pollPromise = new Promise( resolve =>
			set( this, "_pollNext", setTimeout( resolve, time ) )
		)
			.then( () => this._poll( false ) )
			.catch( logError );
	},

	/**
	 * @returns {Promise<TwitchStream[]>}
	 */
	async _pollQuery() {
		const { store } = this;
		const allStreams = A();
		const params = {
			user_id: this.auth.session.user_id,
			first
		};
		let num = 0;

		// eslint-disable-next-line no-constant-condition
		while ( ++num <= maxQueries ) {
			const streams = await store.query( "twitch-stream-followed", params );

			// add new streams to the overall streams list
			allStreams.push( ...streams.mapBy( "stream" ) );

			// stop querying as soon as a request doesn't have enough items
			// otherwise query again with an increased offset
			if ( streams.length < first || !streams.meta.pagination ) {
				break;
			}

			params.after = streams.meta.pagination.cursor;
		}

		// remove any potential duplicates that may have occured between multiple requests
		return allStreams.uniqBy( "id" );
	},

	/**
	 * @param {TwitchStream[]} allStreams
	 * @param {boolean?} firstRun
	 * @returns {Promise}
	 */
	async _pollResult( allStreams, firstRun ) {
		try {
			this.trigger( "streams-all", allStreams );

			// fill cache and get streams which are new
			const newStreams = cacheFill( allStreams, firstRun );
			this.trigger( "streams-new", newStreams );

			// remove disabled channels
			const filteredStreams = await this._filterStreams( newStreams );
			this.trigger( "streams-filtered", filteredStreams );

		} catch ( e ) {
			await logError( e );
		}
	},

	/**
	 * @param {TwitchStream[]} streams
	 * @returns {Promise<TwitchStream[]>}
	 */
	async _filterStreams( streams ) {
		const filter = this.settings.content.notification.filter;

		// filter vodcasts before loading channel settings
		if ( this.settings.content.notification.filter_vodcasts ) {
			streams = streams.filter( stream => !stream.isVodcast );
		}

		// get a list of all streams and their channel's individual settings
		const streamSettingsObjects = await Promise.all( streams.map( async stream => {
			const { notification_enabled } = await stream.getChannelSettings();

			return { stream, notification_enabled };
		}) );

		return streamSettingsObjects
			.filter( ({ notification_enabled }) => filter === true
				// include all, exclude disabled (blacklist)
				? notification_enabled !== false
				// exclude all, include enabled (whitelist)
				: notification_enabled === true
			)
			.map( ({ stream }) => stream );
	}
});
