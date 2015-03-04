define( [ "nwGui", "ember" ], function( nwGui, Ember ) {

	return Ember.Route.extend({
		init: function() {
			this._super();
			this.controllerFor( "versioncheck" );
			this.controllerFor( "userAuth" );
			this.controllerFor( "notification" );
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

			"goto": function( routeName ) {
				var currentRoute = this.controller.get( "currentRouteName" );
				if ( routeName === currentRoute ) {
					this.send( "refresh" );
				} else {
					this.transitionTo.apply( this, arguments );
				}
			},

			"openBrowser": function( url ) {
				nwGui.Shell.openExternal( url );
			},

			"openLivestreamer": function( stream ) {
				this.controllerFor( "livestreamer" ).startStream( stream );
			},

			"openModal": function( template, controller, data ) {
				var view = "modal";
				if ( template instanceof Object ) {
					view     = template.view;
					template = template.template;
				}
				if ( typeof controller === "string" ) {
					controller = this.controllerFor( controller );
				}
				if ( controller && data instanceof Object ) {
					controller.setProperties( data );
				}

				this.render( template, {
					into      : "application",
					outlet    : "modal",
					view      : view,
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
