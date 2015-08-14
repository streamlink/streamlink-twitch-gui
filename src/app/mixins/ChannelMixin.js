define( [ "Ember", "nwjs/nwGui" ], function( Ember, nwGui ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Mixin.create({
		metadata: Ember.inject.service(),
		auth    : Ember.inject.service(),

		checkUserFollowsChannel: function( channel ) {
			if ( !get( this, "auth.session.isLoggedIn" ) ) { return; }

			var store = get( this, "store" );
			var name  = get( channel, "id" );
			return store.findRecord( "twitchUserFollowsChannel", name, { reload: true } )
				.catch(function() {
					// unload the generated empty record
					var record = store.peekRecord( "twitchUserFollowsChannel", name );
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
			if ( !get( this, "auth.session.isLoggedIn" ) ) { return; }
			if ( !get( channel, "partner" ) ) { return; }

			var store = get( this, "store" );
			var name  = get( channel, "id" );
			return store.findRecord( "twitchUserSubscription", name, { reload: true } )
				.catch(function() {
					// unload the generated empty record
					var record = store.peekRecord( "twitchUserSubscription", name );
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
				var store     = get( this, "store" );
				var following = get( channel, "following" );

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
				var url  = get( this, "metadata.config.twitch-subscribe-url" );
				var name = get( channel, "id" );
				if ( url && name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
					if ( callback instanceof Function ) {
						callback();
					}
				}
			},

			"chat": function( channel, callback ) {
				var url  = get( this, "metadata.config.twitch-chat-url" );
				var name = get( channel, "id" );
				if ( url && name ) {
					this.send( "openBrowser", url.replace( "{channel}", name ) );
					if ( callback instanceof Function ) {
						callback();
					}
				}
			},

			"share": function( channel, callback ) {
				var url = get( channel, "url" );
				var cb  = nwGui.Clipboard.get();
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
