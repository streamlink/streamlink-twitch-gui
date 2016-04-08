define([
	"Ember"
], function(
	Ember
) {

	function boolNot( value ) {
		return !value;
	}


	return Ember.Helper.helper(function( params ) {
		return params.every( boolNot );
	});

});
