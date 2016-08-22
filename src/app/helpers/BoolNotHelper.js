import Ember from "Ember";


	function boolNot( value ) {
		return !value;
	}


	export default Ember.Helper.helper(function( params ) {
		return params.every( boolNot );
	});
