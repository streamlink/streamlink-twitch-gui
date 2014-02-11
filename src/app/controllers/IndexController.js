define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		stream: function() {
			return this.get( "model.featured.0.stream" );
		}.property( "model.featured.0.stream" ),

		actions: {
			"switchFeatured": function( stream ) {
				this.set( "stream", stream );
			}
		}
	});

});
