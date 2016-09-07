import { Helper } from "Ember";


export default Helper.helper(function( params ) {
	return params[0] > params[1];
});
