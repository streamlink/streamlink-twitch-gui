define([
	"Ember"
], function(
	Ember
) {

	function isNull( currentValue ) {
		return currentValue === null;
	}


	return Ember.Helper.helper(function( params ) {
		return params.every( isNull );
	});

});
