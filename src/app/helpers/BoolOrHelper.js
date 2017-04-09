import { Helper } from "ember";


function boolOr( value ) {
	return value;
}


export default Helper.helper(function( params ) {
	return params.some( boolOr );
});
