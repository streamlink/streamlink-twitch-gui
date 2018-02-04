import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	access_end: attr( "date" ),
	access_start: attr( "date" ),
	product: belongsTo( "twitchProduct", { async: false } ),
	purchase_profile: attr()

}).reopenClass({
	toString() { return "api/users/:user_name/tickets"; }
});
