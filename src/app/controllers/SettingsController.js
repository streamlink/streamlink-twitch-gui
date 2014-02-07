define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: [ "application", "modal" ],

		hasChanged: false,

		actions: {
			apply: function( callback ) {
				var	model	= this.get( "model" ),
					content	= this.get( "content" );

				// TODO: Validate
				var valid = true;

				if ( valid ) {
					model.eachAttribute(function( attr ) {
						model.set( attr, content.get( attr ) );
					});
					model.save();

					this.set( "hasChanged", false );

					if ( callback ) { callback(); }
				}
			},

			discard: function() {
				var	model	= this.get( "model" ),
					content	= this.get( "content" );

				model.rollback();
				model.eachAttribute(function( attr ) {
					content.set( attr, model.get( attr ) );
				});

				this.set( "hasChanged", false );
			}
		}
	});

});
