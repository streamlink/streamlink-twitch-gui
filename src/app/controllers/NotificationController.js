define([
	"ember",
	"utils/mkdirp",
	"utils/download",
	"utils/clearfolder"
], function( Ember, mkdirp, download, clearfolder ) {

	var PATH  = require( "path" ),
	    OS    = require( "os" ),
	    Notif = window.Notification,
	    get   = Ember.get,
	    set   = Ember.set;

	return Ember.Controller.extend({
		configBinding  : "metadata.package.config",
		intervalBinding: "config.notification-interval",

		// cache related properties
		cacheDir: function() {
			var dir = get( this, "config.notification-cache-dir" );
			return PATH.resolve( dir.replace( "{os-tmpdir}", OS.tmpdir() ) );
		}.property( "config.notification-cache-dir" ),
		cacheTime: function() {
			var days = get( this, "config.notification-cache-time" );
			return days * 24 * 3600 * 1000;
		}.property( "config.notification-cache-time" ),

		// use the app icon as group icon
		iconGroup: function() {
			return get( this, "config.tray-icon" ).replace( "{res}", 256 );
		}.property( "config.tray-icon" ),

		// controller state
		firstRun: true,
		model   : {},

		// automatically start polling once the user is logged in and has notifications enabled
		enabled: Ember.computed.and( "auth.isLoggedIn", "settings.notify_enabled" ),
		enabledObserver: function() {
			if ( get( this, "enabled" ) ) {
				this.setProperties({
					firstRun: true,
					model   : {}
				});

				// collect garbage once at the beginning
				this.gc_icons()
					// then start
					.then( this.check.bind( this ) );
			}
		}.observes( "enabled" ).on( "init" ),


		check: function() {
			if ( !get( this, "enabled" ) ) { return; }

			this.store.find( "twitchStreamsFollowed" )
				.then( this.queryCallback.bind( this ) )
				.then(function( newStreams ) {
					// show notifications
					if ( newStreams && newStreams.length ) {
						return this.prepareNotifications( newStreams );
					}
				}.bind( this ) )
				.then(function() {
					// query again in X milliseconds
					Ember.run.later( this, this.check, get( this, "interval" ) || 60000 );
				}.bind( this ) );
		},

		queryCallback: function( streams ) {
			/** @type {Object} model */
			var model, newStreams;

			// just fill the cache on the first run
			if ( !get( this, "firstRun" ) ) {
				// get a list of all new streams by comparing the cached streams
				model = get( this, "model" );
				newStreams = streams.filter(function( stream ) {
					var name  = get( stream, "channel.name" ),
					    since = get( stream, "created_at" );
					return name && ( !model.hasOwnProperty( name ) || model[ name ] < since );
				});
			}
			set( this, "firstRun", false );

			// update cache
			model = streams.reduce(function( obj, stream ) {
				obj[ get( stream, "channel.name" ) ] = get( stream, "created_at" );
				return obj;
			}, {} );
			set( this, "model", model );

			return newStreams;
		},


		prepareNotifications: function( streams ) {
			// merge multiple notifications and show a single one
			if ( streams.length > 1 && get( this.settings, "notify_grouping" ) ) {
				return this.showNotificationGroup( streams );

			// show all notifications
			} else {
				// download all channel icons first and save them into a local temp dir...
				return mkdirp( get( this, "cacheDir" ) )
					.then(function( iconTempDir ) {
						return Promise.all( streams.map(function( stream ) {
							var logo = get( stream, "channel.logo" );
							return download( logo, iconTempDir )
								.then(function( file ) {
									// the channel logo is now the local file
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
				icon : get( this, "groupIcon" ),
				title: "Some of your favorites have come online",
				body : streams.map(function( stream ) {
					return get( stream, "channel.display_name" );
				}).join( ", " ),
				click: function() {
					var settings = get( this, "settings.notify_click_group" );
					streams.forEach( this.notificationClick.bind( this, settings ) );
				}.bind( this )
			});
		},

		showNotificationSingle: function( stream ) {
			this.showNotification({
				icon : get( stream, "channel.logo" ),
				title: "%@ has come online".fmt( get( stream, "channel.display_name" ) ),
				body : get( stream, "channel.status" ),
				click: function() {
					var settings = get( this, "settings.notify_click" );
					this.notificationClick( settings, stream );
				}.bind( this )
			});
		},

		notificationClick: function( settings, stream ) {
			switch( settings ) {
				case 1:
					// restore the window
					this.nwWindow.toggleMinimize( true );
					this.nwWindow.toggleVisibility( true );
					this.send( "goto", "user.following" );
					break;
				case 2:
					this.send( "openLivestreamer", stream );
					break;
				case 3:
					var url = get( this, "config.twitch-chat-url" )
						.replace( "{channel}", get( stream, "name" ) );
					this.send( "openLivestreamer", stream );
					this.send( "openBrowser", url );
			}
		},

		showNotification: function( obj ) {
			var notify = new Notif( obj.title, {
				icon: obj.icon,
				body: obj.body
			});
			if ( obj.click ) {
				notify.addEventListener( "click", function() {
					this.close();
					obj.click();
				}, false );
			}
		},


		gc_icons: function() {
			var cacheDir  = get( this, "cacheDir" ),
			    cacheTime = get( this, "cacheTime" );

			return clearfolder( cacheDir, cacheTime )
				// always resolve
				.catch(function() {});
		}
	});

});
