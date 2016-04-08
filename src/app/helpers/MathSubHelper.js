define([
	"Ember"
], function(
	Ember
) {

	function mathSub( valueA, valueB ) {
		return valueA - valueB;
	}


	return Ember.Helper.helper(function( params ) {
		return params.reduce( mathSub );
	});

});
