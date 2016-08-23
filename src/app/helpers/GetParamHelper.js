import { Helper } from "Ember";


export default Helper.helper(function( params, hash ) {
	return params[ hash.index ];
});
