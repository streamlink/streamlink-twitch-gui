define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function() {
			// Load Settings records
			this.store.findAll( "settings" ).then(function() {
				try {
					// Create initial Settings record
					this.store.createRecord( "settings", { id: 1 } ).save();
				} catch ( e ) {}
			}.bind( this ) );
		},

		model: function() {
			return Ember.$.getJSON( "metadata.json" );
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
		},


		actions: {
			"history": function( action ) {
				window.history.go( +action );
			},

			"goto": function() {
				this.transitionTo.apply( this, arguments );
			},

			"open_browser": function( url ) {
				this.get( "controller.nwGui" ).Shell.openExternal( url );
			},

			"open_livestreamer": function( stream ) {
				this.store.find( "settings", 1 ).then(function( settings ) {
					this.get( "controller.controllers.livestreamer" ).send(
						"start", settings, stream
					);
				}.bind( this ) );
			},

			"openModal": function( head, body, buttons ) {
				this.send( "updateModal", head, body, buttons );

				return this.render( "modal", {
					into		: "application",
					outlet		: "modal"
				});
			},

			"updateModal": function( head, body, buttons ) {
				var Modal = this.controllerFor( "modal" );
				if (    head !== undefined ) { Modal.set(    "head",    head ); }
				if (    body !== undefined ) { Modal.set(    "body",    body ); }
				if ( buttons !== undefined ) { Modal.set( "buttons", buttons ); }
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
