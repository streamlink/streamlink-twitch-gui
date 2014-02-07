define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function() {
			var store = this.store;

			// Create initial Settings record
			store.find( "settings", 1 ).then(
				// Settings already exist
				function() {},
				// Settings do not exists yet...
				function() {
					store.createRecord( "settings", { id: 1 } ).save();
				}
			);
		},

		model: function() {
			return Ember.$.getJSON( "/metadata.json" );
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
		},


		actions: {
			"open_browser": function( url ) {
				this.get( "controller.nwGui" ).Shell.openExternal( url );
			},

			"open_livestreamer": function( stream ) {
				this.store.find( "settings", 1 ).then(function( settings ) {
					var	path = settings.get( "livestreamer" ),
						qualities = settings.get( "qualities" ),
						quality = settings.get( "quality" );

					require( "child_process" ).spawn(
						path.length ? path : "livestreamer",
						[
							stream.channel.url,
							qualities.hasOwnProperty( quality )
								? qualities[ quality ].quality
								: qualities[ 0 ].quality
						]
					);
				});
			},

			"openModal": function( head, body, buttons ) {
				var Modal = this.controllerFor( "modal" );
				Modal.set( "head", head );
				Modal.set( "body", body );
				Modal.set( "buttons", buttons );

				return this.render( "modal", {
					into		: "application",
					outlet		: "modal"
				});
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
