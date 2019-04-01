import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default Fragment.extend({
	consecutive_months: attr( "number" ),
	expired: attr( "boolean" ),
	paid_on: attr( "date" ),
	refundable: attr( "boolean" ),
	renewal_date: attr( "date" ),
	will_renew: attr( "boolean" )
});
