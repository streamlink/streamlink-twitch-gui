define( [ "ember" ], function( Ember ) {

	return Ember.ArrayController.extend({
		auth: Ember.inject.service(),

		sortAscending: false,
		sortProperties: [ "started" ]
	});

});
