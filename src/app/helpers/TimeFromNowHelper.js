import FromNowHelper from "helpers/-FromNowHelper";
import Moment from "moment";


export default FromNowHelper.extend({
	_compute( params, hash ) {
		return new Moment( params[0] ).fromNow( hash.suffix || params[1] );
	}
});
