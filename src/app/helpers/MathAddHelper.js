import Ember from "Ember";


function mathAdd( valueA, valueB ) {
	return valueA + valueB;
}


export default Ember.Helper.helper(function( params ) {
	return params.reduce( mathAdd );
});
