define([
	"Ember"
], function(
	Ember
) {

	function mathMul( valueA, valueB ) {
		return valueA * valueB;
	}


	return Ember.Helper.helper(function( params ) {
		return params.reduce( mathMul );
	});

});
