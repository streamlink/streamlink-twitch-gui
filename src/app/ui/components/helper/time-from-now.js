import { helper as FromNowHelper } from "./-from-now";
import Moment from "moment";


export const helper = FromNowHelper.extend({
	_compute( params, hash ) {
		return new Moment( params[0] ).fromNow( hash.suffix || params[1] );
	}
});
