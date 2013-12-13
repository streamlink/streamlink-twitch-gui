define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		streams: function() {
			return this.get( "model.streams" );
		}.property( "model.streams" )
	});

});
