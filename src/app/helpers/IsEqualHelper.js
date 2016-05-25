define([
	"Ember"
], function(
	Ember
) {

	function isEqual( currentValue, index, arr ) {
		return currentValue === arr[ 0 ];
	}


	return Ember.Helper.helper(function( params ) {
		return params.every( isEqual );
	});

});
