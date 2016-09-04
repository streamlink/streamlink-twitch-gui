import {
	get,
	set,
	setProperties,
	getOwner,
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


function StreamCache( stream ) {
	this.id    = get( stream, "channel.id" );
	this.since = get( stream, "created_at" );
	this.fails = 0;
}

StreamCache.prototype.findStreamIndex = function( streams ) {
	for ( var id = this.id, i = 0, l = streams.length; i < l; i++ ) {
		if ( get( streams[ i ], "channel.id" ) === id ) {
			return i;
		}
	}

	return -1;
};

StreamCache.prototype.isNotNewer = function( stream ) {
	return this.since >= get( stream, "created_at" );
};


export default Service.extend( ChannelSettingsMixin, {
	auth: service(),
	chat: service(),
	livestreamer: service(),
	settings: service(),
	store: service(),


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
		var status = !get( this, "enabled" )
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
		var self    = this;
		var store   = get( self, "store" );
		var follows = store.modelFor( "twitchUserFollowsChannel" );
		var adapter = store.adapterFor( "twitchUserFollowsChannel" );

		adapter.on( "createRecord", function( store, type, snapshot ) {
			if ( !get( self, "running" ) ) { return; }
			if ( type !== follows ) { return; }

			var id = snapshot.id;
			// is the followed channel online?
			store.findRecord( "twitchStream", id, { reload: true } )
				.then(function( stream ) {
					var model = get( self, "model" );
					if ( model.findBy( "id", id ) ) { return; }
					model.push( new StreamCache( stream ) );
				});
		});
	}),


	_setWindowBadgeLabel() {
		var label;
		if ( !get( this, "running" ) || !get( this, "settings.notify_badgelabel" ) ) {
			label = "";

		} else {
			var num = get( this, "model.length" );
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
		var self = this;
		var menu = getTrayMenu();
		var item = null;

		function createTrayItem() {
			var enabled = get( self, "enabled" );
			if ( !enabled ) {
				if ( item ) {
					menu.items.removeObject( item );
				}
				set( self, "paused", false );
				return;
			}

			item = {
				type   : "checkbox",
				label  : "Pause notifications",
				tooltip: "Quickly toggle desktop notifications",
				checked: get( self, "paused" ),
				click( item ) {
					set( self, "paused", item.checked );
				}
			};

			menu.items.unshiftObject( item );
		}

		createTrayItem();
		this.addObserver( "enabled", createTrayItem );
	}),


	reset() {
		var next = get( this, "_next" );
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
			.then( this.check.bind( this ) );
	},

	check() {
		if ( !get( this, "running" ) ) { return; }

		get( this, "store" ).query( "twitchStreamsFollowed", {
			limit: 100
		})
			.then( mapBy( "stream" ) )
			.then( this.queryCallback.bind( this ) )
			.then( this.stripDisabledChannels.bind( this ) )
			.then( this.prepareNotifications.bind( this ) )
			.then( this.success.bind( this ) )
			.catch( this.failure.bind( this ) );
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
		var tries = get( this, "_tries" );
		var interval;

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

		var next = later( this, this.check, interval );
		set( this, "_next", next );
	},

	queryCallback( streams ) {
		var model = get( this, "model" );

		// figure out which streams are new
		for ( var item, idx, i = 0, l = model.length; i < l; i++ ) {
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
		model.pushObjects( streams.map(function( stream ) {
			return new StreamCache( stream );
		}) );

		// just fill the cache and return an empty array of new streams on the first run
		if ( get( this, "_first" ) ) {
			set( this, "_first", false );
			return [];
		}

		return streams;
	},


	stripDisabledChannels( streams ) {
		var all = get( this, "settings.notify_all" );

		return Promise.all( streams.map(function( stream ) {
			var name = get( stream, "channel.id" );
			return this.loadChannelSettings( name )
				.then(function( settings ) {
					return { stream, settings };
				});
		}, this ) )
			.then(function( streams ) {
				return streams
					.filter(function( data ) {
						var enabled = get( data.settings, "notify_enabled" );
						return all === true
							// include all, exclude disabled
							? enabled !== false
							// exclude all, include enabled
							: enabled === true;
					})
					.map(function( data ) {
						return data.stream;
					});
			});
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
				.then(function( iconTempDir ) {
					return Promise.all( streams.map(function( stream ) {
						var logo = get( stream, "channel.logo" );
						return download( logo, iconTempDir )
							.then(function( file ) {
								// the channel logo is now the local file
								file = `file://${file}`;
								set( stream, "logo", file );
								return stream;
							});
					}) );
				})
				.then(function( streams ) {
					streams.forEach( this.showNotificationSingle, this );
				}.bind( this ) );
		}
	},

	showNotificationGroup: function( streams ) {
		this.showNotification({
			title  : "Some followed channels have started streaming",
			message: streams.map(function( stream ) {
				/** @type NotificationMessageList */
				return {
					title  : get( stream, "channel.display_name" ),
					message: get( stream, "channel.status" ) || ""
				};
			}),
			icon   : `file://${iconGroup}`,
			click  : this.notificationClick.bind( this, streams )
		});
	},

	showNotificationSingle: function( stream ) {
		this.showNotification({
			title  : get( stream, "channel.display_name" ) + " has started streaming",
			message: get( stream, "channel.status" ) || "",
			icon   : get( stream, "logo" ) || get( stream, "channel.logo" ),
			click  : this.notificationClick.bind( this, [ stream ] )
		});
	},

	notificationClick: function( settings, streams ) {
		// always restore the window
		if ( settings !== 0 ) {
			toggleMinimize( true );
			toggleVisibility( true );
		}

		var applicationController = getOwner( this ).lookup( "controller:application" );

		switch( settings ) {
			// followed streams menu
			case 1:
				applicationController.send( "goto", "user.followedStreams" );
				break;
			// launch stream
			case 2:
				streams.forEach(function( stream ) {
					get( this, "livestreamer" ).startStream( stream );
				}, this );
				break;
			// launch stream + chat
			case 3:
				streams.forEach(function( stream ) {
					get( this, "livestreamer" ).startStream( stream );
					// don't open the chat twice (startStream may open chat already)
					if ( get( this, "settings.gui_openchat" ) ) { return; }
					var chat    = get( this, "chat" );
					var channel = get( stream, "channel.id" );
					chat.open( channel )
						.catch(function() {});
				}, this );
				break;
		}
	},

	showNotification: function( data ) {
		var provider = get( this, "settings.notify_provider" );
		showNotification( provider, data )
			.catch(function() {});
	},


	gc_icons() {
		return clearfolder( cacheTmpDir, cacheTime )
			// always resolve
			.catch(function() {});
	}
});
