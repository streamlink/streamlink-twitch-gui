import Ember from "Ember";


function mathSub( valueA, valueB ) {
	return valueA - valueB;
}


export default Ember.Helper.helper(function( params ) {
	return params.reduce( mathSub );
});
