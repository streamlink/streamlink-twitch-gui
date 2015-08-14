define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var set = Ember.set;
	var bool = Ember.computed.bool;

	return Ember.ArrayController.extend({
		auth : Ember.inject.service(),
		store: Ember.inject.service(),

		game: null,

		following: null,
		isFollowing: bool( "following" ),
		isFollowingLoading: false,
		isFollowingLocked: false,


		_checkUserFollowsGame: function() {
			var isLoggedIn = get( this, "auth.session.isLoggedIn" );
			var game       = get( this, "game" );
			if ( !isLoggedIn || !game ) { return; }

			set( this, "following", null );
			set( this, "isFollowingLoading", true );
			set( this, "isFollowingLocked", true );

			var store = get( this, "store" );
			return store.findRecord( "twitchUserFollowsGame", game )
				.catch(function() {
					// unload the generated empty record
					var record = store.peekRecord( "twitchUserFollowsGame", game );
					if ( record ) {
						store.unloadRecord( record );
					}
					return false;
				})
				.then(function( record ) {
					set( this, "following", record );
					set( this, "isFollowingLoading", false );
					set( this, "isFollowingLocked", false );
				}.bind( this ) );
		}.observes( "auth.session.isLoggedIn", "game" ),


		actions: {
			"followGame": function( callback ) {
				if ( get( this, "isFollowingLocked" ) ) { return; }
				set( this, "isFollowingLocked", true );

				var self      = this;
				var store     = get( this, "store" );
				var game      = get( this, "game" );
				var following = get( this, "following" );

				function unlock() { set( self, "isFollowingLocked", false ); }

				if ( !following ) {
					// create a new record and save it
					following = store.createRecord( "twitchUserFollowsGame", { id: game });
					following.save()
						.then(function( record ) {
							set( self, "following", record );
						})
						.then( callback )
						.then( unlock, unlock );

				} else {
					// delete the record and save it
					following.destroyRecord()
						.then(function() {
							set( self, "following", null );
							// also unload it
							store.unloadRecord( following );
						})
						.then( callback )
						.then( unlock, unlock );
				}
			}
		}
	});

});
