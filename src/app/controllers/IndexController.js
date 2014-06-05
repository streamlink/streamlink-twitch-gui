define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		summaryBinding: "content.summary",
		featuredBinding: "content.featured",

		// no binding here: just get an initial value
		stream: function() {
			return this.get( "featured.0.stream" );
		}.property( "featured.0.stream" ),

		actions: {
			"switchFeatured": function( stream ) {
				this.set( "stream", stream );
			}
		}
	});

});
