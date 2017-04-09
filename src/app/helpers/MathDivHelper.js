import { Helper } from "ember";


function mathDiv( valueA, valueB ) {
	return valueA / valueB;
}


export default Helper.helper(function( params ) {
	return params.reduce( mathDiv );
});
