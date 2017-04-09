import { Helper } from "ember";


function boolNot( value ) {
	return !value;
}


export default Helper.helper(function( params ) {
	return params.every( boolNot );
});
