import {
	get,
	set,
	setProperties,
	computed,
	inject,
	run,
	observer,
	on,
	Service
} from "Ember";
import {
	files,
	notification
} from "config";
import nwWindow, {
	toggleMinimize,
	toggleVisibility
} from "nwjs/Window";
import { getMenu as getTrayMenu } from "nwjs/Tray";
import ChannelSettingsMixin from "mixins/ChannelSettingsMixin";
import { mapBy } from "utils/ember/recordArrayMethods";
import {
	isWin,
	tmpdir
} from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import mkdirp from "utils/node/fs/mkdirp";
import download from "utils/node/fs/download";
import clearfolder from "utils/node/fs/clearfolder";
import { show as showNotification } from "utils/Notification";


const { and } = computed;
const { service } = inject;
const { cancel, debounce, later } = run;
const {
	cache: {
		"dir": cacheDir,
		"time": cacheTime
	},
	fails: {
		"requests": failsRequests,
		"channels": failsChannels
	},
	interval: {
		"request": intervalSuccess,
		"retry": intervalRetry,
		"error": intervalError
	}
} = notification;
const { icons: { "big": bigIcon } } = files;

const iconGroup = isWin
	? resolvePath( "%NWJSAPPPATH%", bigIcon )
	: resolvePath( bigIcon );
const cacheTmpDir = tmpdir( cacheDir );


class StreamCache {
	constructor( stream ) {
		this.id    = get( stream, "channel.id" );
		this.since = get( stream, "created_at" );
		this.fails = 0;
	}

	/**
	 * @param {TwitchStream[]} streams
	 * @returns {Number}
	 */
	findStreamIndex( streams ) {
		for ( let id = this.id, i = 0, l = streams.length; i < l; i++ ) {
			if ( get( streams[ i ], "channel.id" ) === id ) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * @param {TwitchStream} stream
	 * @returns {Boolean}
	 */
	isNotNewer( stream ) {
		return this.since >= get( stream, "created_at" );
	}
}


export default Service.extend( ChannelSettingsMixin, {
	auth: service(),
	chat: service(),
	routing: service( "-routing" ),
	settings: service(),
	store: service(),
	streaming: service(),


	model : [],
	notifs: [],
	_first: true,
	_tries: 0,
	_next : null,
	_error: false,


	// automatically start polling once the user is logged in and has notifications enabled
	enabled: and( "auth.session.isLoggedIn", "settings.notify_enabled" ),
	// notifications disabled via tray item
	// don't link this property with `enabled` (observe both instead)
	paused : false,
	running: computed( "enabled", "paused", function() {
		return get( this, "enabled" ) && !get( this, "paused" );
	}),
	error  : and( "running", "_error" ),


	enabledObserver: observer( "running", function() {
		if ( get( this, "running" ) ) {
			this.start();
		} else {
			this.reset();
		}
	}).on( "init" ),


	statusText: computed( "enabled", "paused", "error", function() {
		let status = !get( this, "enabled" )
			? "disabled"
			: get( this, "paused" )
			? "paused"
			: get( this, "error" )
			? "offline"
			: "enabled";

		return `Desktop notifications are ${status}`;
	}),


	/**
	 * Add a newly followed channel to the channel list cache
	 * so it doesn't pop up a new notification on the next query
	 */
	_userHasFollowedChannel: on( "init", function() {
		const store   = get( this, "store" );
		const follows = store.modelFor( "twitchChannelFollowed" );
		const adapter = store.adapterFor( "twitchChannelFollowed" );

		adapter.on( "createRecord", ( store, type, snapshot ) => {
			if ( !get( this, "running" ) ) { return; }
			if ( type !== follows ) { return; }

			let id = snapshot.id;
			// is the followed channel online?
			store.findRecord( "twitchStream", id, { reload: true } )
				.then( stream => {
					/** @type {StreamCache[]} */
					let model = get( this, "model" );
					if ( model.find( item => item.id === id ) ) { return; }
					model.push( new StreamCache( stream ) );
				});
		});
	}),


	_setWindowBadgeLabel() {
		let label;
		if ( !get( this, "running" ) || !get( this, "settings.notify_badgelabel" ) ) {
			label = "";

		} else {
			let num = get( this, "model.length" );
			label = String( num );
		}
		// update badge label or remove it
		nwWindow.setBadgeLabel( label );
	},

	_windowBadgeLabelObserver: observer(
		"running",
		"settings.notify_badgelabel",
		"model.[]",
		function() {
			debounce( this, "_setWindowBadgeLabel", 500 );
		}
	),


	_setupTrayItem: on( "init", function() {
		let item = null;
		const menu = getTrayMenu();

		const createTrayItem = () => {
			let enabled = get( this, "enabled" );
			if ( !enabled ) {
				if ( item ) {
					menu.items.removeObject( item );
				}
				set( this, "paused", false );
				return;
			}

			item = {
				type   : "checkbox",
				label  : "Pause notifications",
				tooltip: "Quickly toggle desktop notifications",
				checked: get( this, "paused" ),
				click  : item => {
					set( this, "paused", item.checked );
				}
			};

			menu.items.unshiftObject( item );
		};

		createTrayItem();
		this.addObserver( "enabled", createTrayItem );
	}),


	reset() {
		let next = get( this, "_next" );
		if ( next ) {
			cancel( next );
		}

		setProperties( this, {
			model : [],
			_first: true,
			_tries: 0,
			_error: false,
			_next : null
		});
	},

	start() {
		this.reset();

		// collect garbage once at the beginning
		this.gc_icons()
			// then start
			.then( () => this.check() );
	},

	check() {
		if ( !get( this, "running" ) ) { return; }

		get( this, "store" ).query( "twitchStreamsFollowed", {
			limit: 100
		})
			.then( mapBy( "stream" ) )
			.then( streams => this.queryCallback( streams ) )
			.then( streams => this.stripDisabledChannels( streams ) )
			.then( streams => this.prepareNotifications( streams ) )
			.then( () => this.success() )
			.catch( () => this.failure() );
	},

	success() {
		// query again
		let next = later( this, this.check, intervalSuccess );

		setProperties( this, {
			_error: false,
			_next : next,
			_tries: 0
		});
	},

	failure() {
		let tries = get( this, "_tries" );
		let interval;

		// did we reach the retry limit yet?
		if ( ++tries > failsRequests ) {
			// reset notification state
			this.reset();
			// let the user know that there was an error...
			set( this, "_error", true );
			// ...but keep going
			interval = intervalError;

		} else {
			set( this, "_tries", tries );
			// immediately retry (with a slight delay)
			interval = intervalRetry;
		}

		let next = later( this, this.check, interval );
		set( this, "_next", next );
	},

	queryCallback( streams ) {
		/** @type {StreamCache[]} */
		let model = get( this, "model" );

		// figure out which streams are new
		for ( let item, idx, i = 0, l = model.length; i < l; i++ ) {
			item = model[ i ];

			// "indexOfBy"
			// streams are ordered, so most of the time the first item matches
			idx = item.findStreamIndex( streams );

			if ( idx !== -1 ) {
				// existing stream found:
				// has the stream still the same creation date?
				if ( item.isNotNewer( streams[ idx ] ) ) {
					// stream hasn't changed:
					// remove stream from record array
					streams.removeAt( idx, 1 );
					// reset fails counter
					item.fails = 0;
					// keep the item (is not new)
					continue;
				}

			} else {
				// stream not found (may be offline):
				// increase fails counter
				if ( ++item.fails <= failsChannels ) {
					// keep the item (has not reached failure limit yet)
					continue;
				}
			}

			// remove item from the model array
			model.removeAt( i, 1 );
			--i;
			--l;
		}

		// add new streams afterwards
		model.pushObjects( streams.map( stream => new StreamCache( stream ) ) );

		// just fill the cache and return an empty array of new streams on the first run
		if ( get( this, "_first" ) ) {
			set( this, "_first", false );
			return [];
		}

		return streams;
	},


	stripDisabledChannels( streams ) {
		let all = get( this, "settings.notify_all" );

		let promiseStreamSettings = streams.map( stream => {
			let name = get( stream, "channel.id" );
			return this.loadChannelSettings( name )
				.then( settings => ({ stream, settings }) );
		});

		return Promise.all( promiseStreamSettings )
			.then( streams => streams
				.filter( data => {
					let enabled = get( data.settings, "notify_enabled" );
					return all === true
						// include all, exclude disabled
						? enabled !== false
						// exclude all, include enabled
						: enabled === true;
				})
				.map( obj => obj.stream )
			);
	},

	prepareNotifications( streams ) {
		if ( !streams.length ) { return; }

		// merge multiple notifications and show a single one
		if ( streams.length > 1 && get( this, "settings.notify_grouping" ) ) {
			return this.showNotificationGroup( streams );

		// show all notifications
		} else {
			// download all channel icons first and save them into a local temp dir...
			return mkdirp( cacheTmpDir )
				.then( iconTempDir =>
					Promise.all( streams.map( stream => {
						let logo = get( stream, "channel.logo" );

						return download( logo, iconTempDir )
							// set the local channel logo on the stream record
							.then( file => set( stream, "logo", file ) )
							.then( () => stream );
					}) )
				)
				.then( streams => streams.forEach(
					stream => this.showNotificationSingle( stream )
				) );
		}
	},

	/**
	 * Show multiple streams as one notification
	 * @param {TwitchStream[]} streams
	 */
	showNotificationGroup( streams ) {
		let settings = get( this, "settings.notify_click_group" );

		this.showNotification({
			title  : "Some followed channels have started streaming",
			message: streams.map( stream => ({
				title  : get( stream, "channel.display_name" ),
				message: get( stream, "channel.status" ) || ""
			}) ),
			icon   : iconGroup,
			click  : () => this.notificationClick( settings, streams ),
			settings
		});
	},

	/**
	 * Show a notification for each stream
	 * @param {TwitchStream} stream
	 */
	showNotificationSingle( stream ) {
		let settings = get( this, "settings.notify_click" );

		this.showNotification({
			title  : get( stream, "channel.display_name" ) + " has started streaming",
			message: get( stream, "channel.status" ) || "",
			icon   : get( stream, "logo" ) || get( stream, "channel.logo" ),
			click  : () => this.notificationClick( settings, [ stream ] ),
			settings
		});
	},

	/**
	 * Notfication click callback
	 * @param {Number} settings
	 * @param {TwitchStream[]} streams
	 */
	notificationClick( settings, streams ) {
		// always restore the window
		if ( settings !== 0 ) {
			toggleMinimize( true );
			toggleVisibility( true );
		}

		let streaming = get( this, "streaming" );

		switch( settings ) {
			// followed streams menu
			case 1:
				get( this, "routing" ).transitionTo( "user.followedStreams" );
				break;

			// launch stream
			case 2:
				streams.forEach( stream => streaming.startStream( stream ) );
				break;

			// launch stream + chat
			case 3:
				streams.forEach( stream => {
					streaming.startStream( stream );
					// don't open the chat twice (startStream may open chat already)
					if ( get( this, "settings.gui_openchat" ) ) { return; }
					let chat    = get( this, "chat" );
					let channel = get( stream, "channel.id" );
					chat.open( channel )
						.catch(function() {});
				});
				break;
		}
	},

	showNotification( data ) {
		let provider = get( this, "settings.notify_provider" );

		showNotification( provider, data, provider !== "auto" )
			.catch(function() {});
	},


	gc_icons() {
		return clearfolder( cacheTmpDir, cacheTime )
			// always resolve
			.catch(function() {});
	}
});
