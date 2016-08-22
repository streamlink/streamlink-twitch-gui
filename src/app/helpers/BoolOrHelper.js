import Ember from "Ember";


	function boolOr( value ) {
		return value;
	}


	export default Ember.Helper.helper(function( params ) {
		return params.some( boolOr );
	});
