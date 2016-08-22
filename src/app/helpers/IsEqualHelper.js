import Ember from "Ember";


	function isEqual( currentValue, index, arr ) {
		return currentValue === arr[ 0 ];
	}


	export default Ember.Helper.helper(function( params ) {
		return params.every( isEqual );
	});
