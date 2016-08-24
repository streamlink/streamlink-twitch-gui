import Ember from "Ember";


function mathDiv( valueA, valueB ) {
	return valueA / valueB;
}


export default Ember.Helper.helper(function( params ) {
	return params.reduce( mathDiv );
});
