define( [ "ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Controller.extend({
		summary : Ember.computed.alias( "model.summary" ),
		featured: Ember.computed.alias( "model.featured" ),

		// reference the active stream by id
		// so we can safely go back to the route
		_index: 0,
		active: function() {
			return get( this, "featured.%@".fmt( get( this, "_index" ) ) );
		}.property( "featured.@each", "_index" ),
		activeObserver: function() {
			set( this, "active.isActive", true );
		}.observes( "active" ),

		stream: Ember.computed.readOnly( "active.stream" ),

		actions: {
			"switchFeatured": function( elem ) {
				var index = get( this, "featured" ).indexOf( elem );
				if ( index === get( this, "_index" ) ) { return; }
				set( this, "active.isActive", false );
				set( this, "_index", index );
			}
		}
	});

});
