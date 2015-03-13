define( [ "nwGui", "ember" ], function( nwGui, Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Mixin.create({
		config: Ember.computed.readOnly( "metadata.package.config" ),


		checkUserFollowsChannel: function( channel ) {
			if ( !get( this, "auth.isLoggedIn" ) ) { return; }

			var name = get( channel, "name" );
			this.store.fetch( "twitchUserFollowsChannel", name )
				.catch(function() {
					// twitch.tv API returned 404: user does not follow the channel
					return false;
				})
				.then(function( record ) {
					set( channel, "following", record );
				});
		},

		checkUserSubscribesChannel: function( channel ) {
			if ( !get( this, "auth.isLoggedIn" ) ) { return; }
			if ( !get( channel, "partner" ) ) { return; }

			var name = get( channel, "name" );
			this.store.fetch( "twitchUserSubscription", name )
				.catch(function() {
					// twitch.tv API returned 404: user does not subscribe the channel
					return false;
				})
				.then(function( record ) {
					set( channel, "subscribed", record );
				});
		},


		actions: {
			"follow": function( channel, callback ) {
				var store     = this.store,
				    following = get( channel, "following" );

				if ( get( channel, "isFollowingLocked" ) ) { return; }
				set( channel, "isFollowingLocked", true );
				function unlock() { set( channel, "isFollowingLocked", false ); }

				if ( !following ) {
					var name = get( channel, "name" );
					// find a previous record and unload it
					following = store.getById( "twitchUserFollowsChannel", name );
					if ( following ) {
						store.unloadRecord( following );
					}
					// now create a new record and save it
					following = store.createRecord( "twitchUserFollowsChannel", { id: name });
					following.save().then(function() {
						var defer = Promise.defer();
						set( channel, "following", following );
						callback( defer.resolve );
						return defer.promise;
					}).then( unlock, unlock );

				} else {
					// delete the record and save it
					following.destroyRecord().then(function() {
						var defer = Promise.defer();
						set( channel, "following", false );
						// also unload it
						store.unloadRecord( following );
						callback( defer.resolve );
						return defer.promise;
					}).then( unlock, unlock );
				}
			},

			"subscribe": function( channel, callback ) {
				var url  = get( this, "config.twitch-subscribe-url" ),
				    name = get( channel, "name" );
				if ( url && name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
					callback();
				}
			},

			"chat": function( channel, callback ) {
				var url  = get( this, "config.twitch-chat-url" ),
				    name = get( channel, "name" );
				if ( url && name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
					if ( callback instanceof Function ) {
						callback();
					}
				}
			},

			"share": function( channel, callback ) {
				var url = get( channel, "url" ),
				    cb  = nwGui.Clipboard.get();
				if ( url && cb ) {
					cb.set( url, "text" );
					callback();
				}
			}
		}
	});

});
