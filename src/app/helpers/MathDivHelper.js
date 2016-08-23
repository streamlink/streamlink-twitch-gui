import { Helper } from "Ember";


function mathDiv( valueA, valueB ) {
	return valueA / valueB;
}


export default Helper.helper(function( params ) {
	return params.reduce( mathDiv );
});
