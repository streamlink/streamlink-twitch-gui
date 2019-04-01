import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment, fragmentArray } from "ember-data-model-fragments/attributes";


export default Fragment.extend({
	emoticons: fragmentArray( "twitch-ticket-product-emoticon" ),
	features: fragment( "twitch-ticket-product-features", { defaultValue: {} } ),
	interval_number: attr( "number" ),
	name: attr( "string" ),
	owner_name: attr( "string" ),
	period: attr( "string" ),
	price: attr( "string" ),
	recurring: attr( "boolean" ),
	short_name: attr( "string" ),
	ticket_type: attr( "string" )
});
