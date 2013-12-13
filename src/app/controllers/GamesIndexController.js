define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		top: function() {
			return this.get( "model.top" );
		}.property( "model.top" )
	});

});
