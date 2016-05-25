define([
	"Ember"
], function(
	Ember
) {

	function boolAnd( value ) {
		return value;
	}


	return Ember.Helper.helper(function( params ) {
		return params.every( boolAnd );
	});

});
