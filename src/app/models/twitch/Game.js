import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	box: belongsTo( "twitchImage", { async: false } ),
	//giantbomb_id: attr( "number" ),
	logo: belongsTo( "twitchImage", { async: false } ),
	name: attr( "string" )
	//popularity: attr( "number" )

}).reopenClass({
	toString() { return "kraken/games"; }
});
