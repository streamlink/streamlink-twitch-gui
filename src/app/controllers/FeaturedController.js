define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var set = Ember.set;
	var alias = Ember.computed.alias;

	return Ember.Controller.extend({
		summary : alias( "model.summary" ),
		featured: alias( "model.featured" ),

		isAnimated: false,

		// reference the active stream by id
		// so we can safely go back to the route
		_index: 0,

		actions: {
			"switchFeatured": function( index ) {
				if ( index === get( this, "_index" ) ) { return; }
				set( this, "_index", index );
				set( this, "isAnimated", true );
			}
		}
	});

});
