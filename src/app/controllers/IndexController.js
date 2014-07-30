define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		summaryBinding: "content.summary",
		featuredBinding: "content.featured",

		stream: Ember.computed.defaultTo( "featured.0.stream" ),

		actions: {
			"switchFeatured": function( stream ) {
				this.set( "stream", stream );
			}
		}
	});

});
