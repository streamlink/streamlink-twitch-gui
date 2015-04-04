define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		summary : Ember.computed.alias( "model.summary" ),
		featured: Ember.computed.alias( "model.featured" ),

		// reference the active stream by id
		// so we can safely go back to the route
		_index: 0
	});

});
