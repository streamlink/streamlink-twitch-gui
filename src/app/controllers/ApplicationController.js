define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "livestreamer", "modal" ],

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
				this.nwWindow.showDevTools()
			},

			"winMin": function() {
				this.nwWindow.minimize();
			},

			"winMax": function() {
				this.nwWindow.toggleMaximize();
			},

			"winClose": function() {
				var	modal	= this.get( "controllers.modal" ),
					quit	= function() {
						this.nwWindow.close( true );
					}.bind( this ),
					stop	= function() {
						this.get( "controllers.livestreamer" ).killAll();
						quit();
					}.bind( this );

				if ( this.get( "streamsLength" ) ) {
					this.send( "openModal",
						"Are you sure you want to quit?",
						"You're still watching streams.",
						[
							new modal.Button( "Return", "", "fa fa-thumbs-down" ),
							new modal.Button( "Shutdown", "btn-danger", "fa fa-power-off", stop ),
							new modal.Button( "Quit", "btn-success", "fa fa-thumbs-up", quit )
						]
					);
				} else {
					quit();
				}
			}
		}
	});

});
