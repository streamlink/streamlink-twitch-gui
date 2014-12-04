define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		isHttp: Ember.computed.equal( "model.player_passthrough", "http" ),

		minimize_observer: function() {
			var	int = get( this, "model.gui_integration" ),
				min = get( this, "model.gui_minimize" ),
				noTask = ( int & 1 ) === 0,
				noTray = ( int & 2 ) === 0;

			// make sure that disabled options are not selected
			if ( noTask && min === 1 ) {
				set( this, "model.gui_minimize", 2 );
			}
			if ( noTray && min === 2 ) {
				set( this, "model.gui_minimize", 1 );
			}

			// enable/disable buttons
			set( this, "settings.constructor.minimize.1.disabled", noTask );
			set( this, "settings.constructor.minimize.2.disabled", noTray );

		}.observes( "model.gui_integration" ),


		actions: {
			apply: function( callback ) {
				var	self	= this,
					model	= get( self, "model" );

				function success() {
					if ( callback ) { callback( true ); }
				}

				function failure() {
					self.settings.rollback();
					if ( callback ) { callback( false ); }
				}

				// copy all attributes back to the original settings record
				self.settings.setProperties( model );
				// and then save
				self.settings.save()
					.then( success, failure );
			},

			discard: function() {
				get( this, "model" ).setProperties(
					this.settings.constructor.readAttributes( this.settings )
				);
			}
		}
	});

});
