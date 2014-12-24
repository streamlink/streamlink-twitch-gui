define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "livestreamer" ],

		dev: DEBUG,

		// use an alias here: a binding will reach the callstack limit
		streamsLength: Ember.computed.alias( "controllers.livestreamer.streams.length" ),

		loginSuccess: Ember.computed.alias( "auth.isLoggedIn" ),
		loginPending: Ember.computed.alias( "auth.isPending" ),
		loginTitle: function() {
			return this.get( "loginSuccess" )
				? "Logged in as %@".fmt( this.get( "auth.user_name" ) )
				: "You're not logged in";
		}.property( "loginSuccess" ),


		actions: {
			"winRefresh": function() {
				this.nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				this.nwWindow.showDevTools();
			},

			"winMin": function() {
				if ( Ember.get( this.settings, "gui_integration" ) === 2 ) {
					// tray only: just hide the window
					this.nwWindow.toggleVisibility( false );
				} else {
					// taskbar or both: just minimize the window
					this.nwWindow.toggleMinimize( false );
				}
			},

			"winMax": function() {
				this.nwWindow.toggleMaximize();
			},

			"winClose": function() {
				if ( this.get( "streamsLength" ) ) {
					this.send( "openModal", "quitModal", this, {
						modalHead: "Are you sure you want to quit?",
						modalBody: "Choose shutdown for closing all streams, too."
					});
				} else {
					this.send( "quit" );
				}
			},

			"quit": function() {
				this.nwWindow.close( true );
			},

			"shutdown": function() {
				this.get( "controllers.livestreamer" ).killAll();
				this.send( "quit" );
			}
		}
	});

});
