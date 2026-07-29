import { inject as service } from "@ember/service";
import { helper as FromNowHelper } from "./-from-now";


const second = 1000;
const minute = 60 * second;
const hour   = 60 * minute;
const day    = 24 * hour;
const month  = 30 * day;
const year   = 365 * day;


export const helper = FromNowHelper.extend({
	intl: service(),

	_compute( [ time ], { localeMatcher, numeric = "auto", style = "long" } = {} ) {
		const reltime = new Intl.RelativeTimeFormat(
			this.intl.locale,
			{ localeMatcher, numeric, style }
		);

		const diff = Date.now() - time;

		if ( diff < hour ) {
			return reltime.format( Math.round( -diff / minute ), "minute" );

		} else if ( diff < day ) {
			return reltime.format( Math.round( -diff / hour ), "hour" );

		} else if ( diff < month ) {
			return reltime.format( Math.round( -diff / day ), "day" );

		} else if ( diff < year ) {
			return reltime.format( Math.round( -diff / month ), "month" );

		} else {
			return reltime.format( Math.round( -diff / year ), "year" );
		}
	}
});
