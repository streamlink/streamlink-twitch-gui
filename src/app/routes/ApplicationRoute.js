define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		init: function() {
			this._super();
			this.controllerFor( "versioncheck" ).check();
			this.controllerFor( "userAuth" ).validateToken();
		},

		actions: {
			"history": function( action ) {
				window.history.go( +action );
			},

			"refresh": function() {
				var routeName = this.controller.get( "currentRouteName" );
				if ( routeName !== "error" ) {
					this.container.lookup( "route:" + routeName ).refresh();
				}
			},

			"goto": function() {
				this.transitionTo.apply( this, arguments );
			},

			"openBrowser": function( url ) {
				this.nwGui.Shell.openExternal( url );
			},

			"openLivestreamer": function( stream ) {
				get( this.controller, "controllers.livestreamer" ).send( "start", stream );
			},

			"openModal": function( template, controller, data ) {
				if ( typeof controller === "string" ) {
					controller = this.controllerFor( controller );
				}
				if ( controller && data instanceof Object ) {
					controller.setProperties( data );
				}

				this.render( template, {
					into      : "application",
					outlet    : "modal",
					view      : "modal",
					controller: controller
				});
			},

			"closeModal": function() {
				this.disconnectOutlet({
					parentView: "application",
					outlet    : "modal"
				});
			}
		}
	});

});
