define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: "application",

		model: function() {
			return this.get( "controllers.application.model" );
		}.property( "controllers.application.model" )
	});

});
