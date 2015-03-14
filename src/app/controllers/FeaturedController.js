define( [ "ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Controller.extend({
		summary : Ember.computed.alias( "model.summary" ),
		featured: Ember.computed.alias( "model.featured" ),

		_streamIndex: 0,
		stream: function() {
			return get( this, "featured.%@.stream".fmt( get( this, "_streamIndex" ) ) );
		}.property( "featured.@each.stream", "_streamIndex" ),

		actions: {
			"switchFeatured": function( featured ) {
				var index = get( this, "featured" ).indexOf( featured );
				set( this, "_streamIndex", index );
			}
		}
	});

});
