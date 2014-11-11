define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.Route.extend({
		setupController: function() {
			// TODO: also create initializers for all this
			this.controllerFor( "versioncheck" ).check();
			this.controllerFor( "userAuth" ).loadUserRecord().catch(function(){});
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

			"goto": function() {
				this.transitionTo.apply( this, arguments );
			},

			"openBrowser": function( url ) {
				get( this.controller, "nwGui" ).Shell.openExternal( url );
			},

			"openLivestreamer": function( stream ) {
				get( this.controller, "controllers.livestreamer" ).send( "start", stream );
			},

			"openModal": function( head, body, controls ) {
				this.send( "updateModal", head, body, controls );

				return this.render( "modal", {
					into		: "application",
					outlet		: "modal"
				});
			},

			"updateModal": function( head, body, controls ) {
				var modal = this.controllerFor( "modal" );
				if (     head !== undefined ) { set( modal,     "head",     head ); }
				if (     body !== undefined ) { set( modal,     "body",     body ); }
				if ( controls !== undefined ) { set( modal, "controls", controls ); }
			},

			"closeModal": function() {
				return this.disconnectOutlet({
					parentView	: "application",
					outlet		: "modal"
				});
			}
		}
	});

});
