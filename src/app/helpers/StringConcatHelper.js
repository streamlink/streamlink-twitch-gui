define( [ "Ember" ], function( Ember ) {

	function concat( string, value ) {
		return string.concat( value ? String( value ) : "" );
	}

	return Ember.Helper.helper(function( params ) {
		return params.reduce( concat, "" );
	});

});
