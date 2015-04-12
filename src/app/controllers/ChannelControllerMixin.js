define( [ "nwGui", "ember" ], function( nwGui, Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Mixin.create({
		config: Ember.computed.readOnly( "metadata.package.config" ),


		checkUserFollowsChannel: function( channel ) {
			if ( !get( this, "auth.isLoggedIn" ) ) { return; }

			var store = this.store;
			var name  = get( channel, "id" );
			this.store.fetchById( "twitchUserFollowsChannel", name )
				.catch(function() {
					// unload the generated empty record
					var record = store.getById( "twitchUserFollowsChannel", name );
					if ( record ) {
						store.unloadRecord( record );
					}

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

			var store = this.store;
			var name  = get( channel, "id" );
			this.store.fetchById( "twitchUserSubscription", name )
				.catch(function() {
					// unload the generated empty record
					var record = store.getById( "twitchUserSubscription", name );
					if ( record ) {
						store.unloadRecord( record );
					}

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
					var name = get( channel, "id" );
					// create a new record and save it
					following = store.createRecord( "twitchUserFollowsChannel", { id: name });
					following.save()
						.then(function() {
							set( channel, "following", following );
						})
						.then( callback )
						.then( unlock, unlock );

				} else {
					// delete the record and save it
					following.destroyRecord()
						.then(function() {
							set( channel, "following", false );
							// also unload it
							store.unloadRecord( following );
						})
						.then( callback )
						.then( unlock, unlock );
				}
			},

			"subscribe": function( channel, callback ) {
				var url  = get( this, "config.twitch-subscribe-url" ),
				    name = get( channel, "id" );
				if ( url && name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
					callback();
				}
			},

			"chat": function( channel, callback ) {
				var url  = get( this, "config.twitch-chat-url" ),
				    name = get( channel, "id" );
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
					if ( callback instanceof Function ) {
						callback();
					}
				}
			}
		}
	});

});
