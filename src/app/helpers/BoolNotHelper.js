import { Helper } from "Ember";


function boolNot( value ) {
	return !value;
}


export default Helper.helper(function( params ) {
	return params.every( boolNot );
});
