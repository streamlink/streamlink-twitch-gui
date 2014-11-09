define( [ "ember", "text!root/metadata.json" ], function( Ember, metadata ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.Route.extend({
		beforeModel: function() {
			// load settings records... also return a promise
			return this.store.find( "settings" )
				.then(function( records ) {
					if ( !records.content.length ) {
						// create initial settings record
						return this.store.createRecord( "settings", { id: 1 } ).save();
					} else {
						return records.objectAt( 0 );
					}
				}.bind( this ) )
				.then(function( settings ) {
					// TODO: save the settings record globally in the application container
					this.settings = settings;
				}.bind( this ) );
		},

		model: function() {
			return JSON.parse( metadata );
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );

			this.controllerFor( "versioncheck" ).check();
			this.controllerFor( "userAuth" ).loadUserRecord().catch(function(){});


			// Redirect to user defined homepage...
			// Transition logic needs to be executed after user auth, so we can handle a possible
			// pending login so that the user can then be redirected to auth required routes.
			// Let the initial transition to the blank index route fulfill first!!!
			Ember.run.next( this, function() {
				if ( get( controller, "currentRouteName" ) === "index" ) {
					var homepage = get( this.settings, "gui_homepage" );
					this.transitionTo( homepage || "featured" );
				}
				delete this.settings;
			});
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
