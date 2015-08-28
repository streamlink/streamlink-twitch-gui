define( [ "Ember", "nwjs/nwWindow" ], function( Ember, nwWindow ) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;

	return Ember.Controller.extend({
		auth        : Ember.inject.service(),
		notification: Ember.inject.service(),
		settings    : Ember.inject.service(),

		needs: [ "livestreamer" ],

		dev: DEBUG,

		streamsLength: readOnly( "controllers.livestreamer.model.length" ),

		notif_enabled: readOnly( "notification.enabled" ),
		notif_running: readOnly( "notification.running" ),
		notif_error  : readOnly( "notification.error" ),

		loginSuccess: readOnly( "auth.session.isLoggedIn" ),
		loginPending: readOnly( "auth.session.isPending" ),
		loginTitle  : function() {
			return get( this, "loginSuccess" )
				? "Logged in as %@%@".fmt(
					get( this, "auth.session.user_name" ),
					get( this, "notif_running" )
						? "\nDesktop notifications enabled"
						: get( this, "notif_error" )
							? "\nDesktop notifications error"
							: ""
				)
				: "You're not logged in";
		}.property( "loginSuccess", "notif_running", "notif_error" ),


		modalHead: "Are you sure you want to quit?",
		modalBody: function() {
			var length = get( this, "streamsLength" );
			return length
				? "By choosing shutdown, all streams will be closed, too."
				: "All streams have been closed. Do you want to quit now?";
		}.property( "streamsLength" ),


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
					this.send( "openModal", "quitModal", this );
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
