define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Helper.helper(function( params ) {
		return get( params[ 0 ], params[ 1 ] );
	});

});
