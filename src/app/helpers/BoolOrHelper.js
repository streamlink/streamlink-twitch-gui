define( [ "Ember" ], function( Ember ) {

	function boolOr( value ) {
		return value;
	}

	return Ember.Helper.helper(function( params ) {
		return params.some( boolOr );
	});

});
