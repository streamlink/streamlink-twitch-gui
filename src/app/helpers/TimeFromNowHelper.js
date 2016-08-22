import FromNowHelper from "helpers/-FromNowHelper";
import Moment from "Moment";


	export default FromNowHelper.extend({
		_compute: function( params, hash ) {
			return new Moment( params[0] ).fromNow( hash.suffix || params[1] );
		}
	});
