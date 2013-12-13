define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		game: null,

		streams: function() {
			return this.get( "model.streams" );
		}.property( "model.streams" )
	});

});
