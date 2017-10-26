import {
	get,
	set,
	setProperties,
	inject,
	run,
	observer,
	Evented,
	EmberNativeArray,
	Mixin
} from "ember";
import {
	notification as notificationConfig
} from "config";
import {
	cacheClear,
	cacheFill
} from "./cache";
import {
	iconDirCreate,
	iconDirClear
} from "./icons";
import { logError } from "./logger";


const { service } = inject;
const { cancel, later } = run;

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
		limit
	}
} = notificationConfig;


export default Mixin.create( Evented, {
	settings: service(),
	store: service(),

	// NotificationService properties
	running: false,
	error: false,

	// state
	_pollNext: null,
	_pollTries: 0,
	_pollInitializedPromise: null,
	_pollPromise: null,


	_pollObserver: observer( "running", function() {
		if ( get( this, "running" ) ) {
			this._pollPromise = this.start();
		} else {
			this.reset();
		}
	}),


	reset() {
		// unqueue
		if ( this._pollNext ) {
			cancel( this._pollNext );
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
			if ( !this._pollInitializedPromise ) {
				this._pollInitializedPromise = Promise.resolve()
					.then( iconDirCreate )
					.then( iconDirClear );
			}
			await this._pollInitializedPromise;

			// start polling
			await this._poll( true );

		} catch ( e ) {
			logError( e );
		}
	},

	/**
	 * @param {boolean?} firstRun
	 * @returns {Promise}
	 */
	async _poll( firstRun ) {
		if ( !get( this, "running" ) ) { return; }

		let streams;
		try {
			// get all followed streams
			streams = await this._pollQuery();
		} catch ( e ) {
			// requeue on query failures
			return this._pollFailure();
		}

		if ( !get( this, "running" ) ) { return; }
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
		let tries = get( this, "_pollTries" );

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
		if ( !get( this, "running" ) ) { return; }

		this._pollPromise = new Promise( resolve =>
			set( this, "_pollNext", later( resolve, time ) )
		)
			.then( () => this._poll( false ) )
			.catch( logError );
	},

	/**
	 * @returns {Promise.<TwitchStream[]>}
	 */
	async _pollQuery() {
		const store = get( this, "store" );
		const allStreams = new EmberNativeArray();

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			const streams = await store.query( "twitchStreamFollowed", {
				offset: get( allStreams, "length" ),
				limit
			});

			// add new streams to the overall streams list
			allStreams.push( ...streams.mapBy( "stream" ) );

			// stop querying as soon as a request doesn't have enough items
			// otherwise query again with an increased offset
			if ( get( streams, "length" ) < limit ) {
				break;
			}
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
			logError( e );
		}
	},

	/**
	 * @param {TwitchStream[]} streams
	 * @returns {Promise<TwitchStream[]>}
	 */
	async _filterStreams( streams ) {
		const notifyAll = get( this, "settings.notify_all" );

		// get a list of all streams and their channel's individual settings
		const streamSettingsObjects = await Promise.all( streams.map( async stream => {
			const channel = get( stream, "channel" );
			const settings = await channel.getChannelSettings();

			return { stream, settings };
		}) );

		return streamSettingsObjects
			.filter( ({ settings: { notify_enabled } }) => notifyAll === true
				// include all, exclude disabled (blacklist)
				? notify_enabled !== false
				// exclude all, include enabled (whitelist)
				: notify_enabled === true
			)
			.map( obj => obj.stream );
	}
});
