define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		actions: {
			"save": function() {
				this.get( "model" ).save();
			},
			"reset": function() {
				this.get( "model" ).rollback();
			}
		}
	});

});
