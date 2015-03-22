define( [ "nwWindow", "ember" ], function( nwWindow, Ember ) {

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
				nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				nwWindow.showDevTools();
			},

			"winMin": function() {
				var integration    = get( this, "settings.gui_integration" ),
				    minimizetotray = get( this, "settings.gui_minimizetotray" );

				// tray only or both with min2tray: just hide the window
				if ( integration === 2 || integration === 3 && minimizetotray ) {
					nwWindow.toggleVisibility( false );
				} else {
					nwWindow.toggleMinimize( false );
				}
			},

			"winMax": function() {
				nwWindow.toggleMaximize();
			},

			"winClose": function() {
				if ( get( this, "streamsLength" ) ) {
					this.send( "openModal", "quitModal", this, {
						modalHead: "Are you sure you want to quit?",
						modalBody: "By choosing shutdown, all streams will be closed, too."
					});
				} else {
					this.send( "quit" );
				}
			},

			"quit": function() {
				nwWindow.close( true );
			},

			"shutdown": function() {
				get( this, "controllers.livestreamer" ).killAll();
				this.send( "quit" );
			}
		}
	});

});
