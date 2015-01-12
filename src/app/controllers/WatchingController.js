define( [ "ember" ], function( Ember ) {

	return Ember.ArrayController.extend({
		sortAscending: false,
		sortProperties: [ "started" ]
	});

});
