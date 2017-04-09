import { Helper } from "ember";


export default Helper.helper(function( params ) {
	return params[0] > params[1];
});
