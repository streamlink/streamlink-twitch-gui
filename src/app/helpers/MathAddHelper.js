define([
	"Ember"
], function(
	Ember
) {

	function mathAdd( valueA, valueB ) {
		return valueA + valueB;
	}


	return Ember.Helper.helper(function( params ) {
		return params.reduce( mathAdd );
	});

});
