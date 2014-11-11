define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		modelBinding: "settings",
		hasChanged: false,

		actions: {
			apply: function( callback ) {
				this.settings.save()
					.then(function() {
						this.set( "hasChanged", false );
						if ( callback ) { callback(); }
					}.bind( this ) );
			},

			discard: function() {
				this.settings.rollback();
				this.set( "hasChanged", false );
			}
		}
	});

});
