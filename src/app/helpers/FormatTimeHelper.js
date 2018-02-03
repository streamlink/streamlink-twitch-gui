import { helper } from "@ember/component/helper";
import Moment from "moment";


export default helper(function( params, hash ) {
	return new Moment( params[0] ).format( hash.format || params[1] );
});
