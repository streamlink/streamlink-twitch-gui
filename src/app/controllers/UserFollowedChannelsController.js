define( [ "Ember" ], function( Ember ) {

	var set = Ember.set;

	return Ember.Controller.extend({
		queryParams: [ "sortby", "direction" ],

		sortby   : "created_at",
		direction: "desc",

		actions: {
			"sortMethod": function( sortby ) {
				set( this, "sortby", sortby );
			},

			"sortOrder": function( direction ) {
				set( this, "direction", direction );
			}
		}
	});

});
