import { Helper } from "ember";


export default Helper.helper(function( params, hash ) {
	return params[ hash.index ];
});
