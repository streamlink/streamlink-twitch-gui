import { Helper } from "Ember";


function isNull( currentValue ) {
	return currentValue === null;
}


export default Helper.helper(function( params ) {
	return params.every( isNull );
});
