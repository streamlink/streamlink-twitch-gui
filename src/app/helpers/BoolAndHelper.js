import Ember from "Ember";


function boolAnd( value ) {
	return value;
}


export default Ember.Helper.helper(function( params ) {
	return params.every( boolAnd );
});
