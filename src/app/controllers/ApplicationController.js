define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "livestreamer", "notification" ],

		dev: DEBUG,

		streamsLength: Ember.computed.readOnly( "controllers.livestreamer.streams.length" ),
		notifications: Ember.computed.readOnly( "controllers.notification.enabled" ),

		loginSuccess: Ember.computed.readOnly( "auth.isLoggedIn" ),
		loginPending: Ember.computed.readOnly( "auth.isPending" ),
		loginTitle: function() {
			return this.get( "loginSuccess" )
				? "Logged in as %@%@".fmt(
					this.get( "auth.user_name" ),
					this.get( "notifications" ) ? "\nDesktop notifications enabled" : ""
				)
				: "You're not logged in";
		}.property( "loginSuccess", "notifications" ),


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
