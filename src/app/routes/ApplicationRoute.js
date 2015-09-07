define( [ "Ember", "nwjs/nwGui" ], function( Ember, nwGui ) {

	var get = Ember.get;

	return Ember.Route.extend({
		settings: Ember.inject.service(),

		init: function() {
			this._super();
			this.controllerFor( "versioncheck" );
		},

		actions: {
			"history": function( action ) {
				window.history.go( +action );
			},

			"refresh": function() {
				var routeName = get( this.controller, "currentRouteName" );
				if ( routeName !== "error" ) {
					this.container.lookup( "route:" + routeName ).refresh();
				}
			},

			"goto": function( routeName ) {
				var currentRoute = get( this.controller, "currentRouteName" );
				if ( routeName === currentRoute ) {
					this.send( "refresh" );
				} else {
					this.transitionTo.apply( this, arguments );
				}
			},

			"gotoHomepage": function( noHistoryEntry ) {
				var homepage = get( this, "settings.gui_homepage" );
				var method   = noHistoryEntry
					? "replaceWith"
					: "transitionTo";
				this.router[ method ]( homepage || "/featured" );
			},

			"openBrowser": function( url ) {
				nwGui.Shell.openExternal( url );
			},

			"openLivestreamer": function( stream ) {
				this.controllerFor( "livestreamer" ).startStream( stream );
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
