define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: "application",

		modelBinding: "controllers.application.model"
	});

});
