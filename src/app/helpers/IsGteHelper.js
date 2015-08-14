define( [ "Ember" ], function( Ember ) {

	return Ember.Helper.helper(function( params ) {
		return params[0] >= params[1];
	});

});
