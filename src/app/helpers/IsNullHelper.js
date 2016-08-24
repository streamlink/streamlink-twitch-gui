import Ember from "Ember";


function isNull( currentValue ) {
	return currentValue === null;
}


export default Ember.Helper.helper(function( params ) {
	return params.every( isNull );
});
