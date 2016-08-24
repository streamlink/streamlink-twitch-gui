import Ember from "Ember";


function mathMul( valueA, valueB ) {
	return valueA * valueB;
}


export default Ember.Helper.helper(function( params ) {
	return params.reduce( mathMul );
});
