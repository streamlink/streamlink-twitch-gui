define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		isHttp: Ember.computed.equal( "model.player_passthrough", "http" ),

		actions: {
			apply: function( callback ) {
				var	self	= this,
					model	= self.get( "model" );

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
				this.get( "model" ).setProperties(
					this.settings.constructor.readAttributes( this.settings )
				);
			}
		}
	});

});
