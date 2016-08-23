import { Helper } from "Ember";
import Moment from "Moment";


export default Helper.helper(function( params, hash ) {
	return new Moment( params[0] ).format( hash.format || params[1] );
});
