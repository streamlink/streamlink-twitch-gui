define( [ "ember" ], function( Ember ) {

	return Ember.View.extend({
		template: null,
		tagName: "i",
		classNames: [ "loading", "fa", "fa-refresh", "fa-spinner" ]
	});

});
