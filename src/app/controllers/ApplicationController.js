define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Controller.extend({
		needs: [ "livestreamer", "notification" ],

		dev: DEBUG,

		streamsLength: Ember.computed.readOnly( "controllers.livestreamer.streams.length" ),

		notif_enabled: Ember.computed.readOnly( "controllers.notification.enabled" ),
		notif_running: Ember.computed.readOnly( "controllers.notification.running" ),
		notif_error  : Ember.computed.readOnly( "controllers.notification.error" ),

		loginSuccess: Ember.computed.readOnly( "auth.isLoggedIn" ),
		loginPending: Ember.computed.readOnly( "auth.isPending" ),
		loginTitle  : function() {
			return get( this, "loginSuccess" )
				? "Logged in as %@%@".fmt(
					get( this, "auth.user_name" ),
					get( this, "notif_running" )
						? "\nDesktop notifications enabled"
						: get( this, "notif_error" )
							? "\nDesktop notifications error"
							: ""
				)
				: "You're not logged in";
		}.property( "loginSuccess", "notif_running", "notif_error" ),


		actions: {
			"winRefresh": function() {
				this.nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				this.nwWindow.showDevTools();
			},

			"winMin": function() {
				if ( get( this.settings, "gui_integration" ) === 2 ) {
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
				if ( get( this, "streamsLength" ) ) {
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
				get( this, "controllers.livestreamer" ).killAll();
				this.send( "quit" );
			}
		}
	});

});
