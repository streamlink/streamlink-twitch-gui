define( [ "Ember" ], function( Ember ) {

	var sort = Ember.computed.sort;

	return Ember.Controller.extend({
		auth: Ember.inject.service(),

		sortedModel: sort( "model", "sortBy" ),
		sortBy: [ "started:desc" ]
	});

});
