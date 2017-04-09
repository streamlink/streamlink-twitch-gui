import { Helper } from "ember";
import Moment from "moment";


export default Helper.helper(function( params, hash ) {
	return new Moment( params[0] ).format( hash.format || params[1] );
});
