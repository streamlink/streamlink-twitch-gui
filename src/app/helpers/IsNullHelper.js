import { Helper } from "ember";


function isNull( currentValue ) {
	return currentValue === null;
}


export default Helper.helper(function( params ) {
	return params.every( isNull );
});
