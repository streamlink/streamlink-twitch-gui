import { helper as FromNowHelper } from "./-from-now";
import Moment from "moment";


export const helper = class TimeFromNowHelper extends FromNowHelper {
	_compute( params, hash ) {
		return new Moment( params[0] ).fromNow( hash.suffix || params[1] );
	}
};
