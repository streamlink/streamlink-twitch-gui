define( [ "Ember" ], function( Ember ) {

	return Ember.Helper.helper(function( params, hash ) {
		return params[ hash.index ];
	});

});
