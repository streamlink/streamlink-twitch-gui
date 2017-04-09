import { Helper } from "ember";


function boolAnd( value ) {
	return value;
}


export default Helper.helper(function( params ) {
	return params.every( boolAnd );
});
