define( [ "Ember" ], function( Ember ) {

	function mathDiv( valueA, valueB ) {
		return valueA / valueB;
	}

	return Ember.Helper.helper(function( params ) {
		return params.reduce( mathDiv );
	});

});
