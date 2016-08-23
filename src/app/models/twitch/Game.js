import {
	attr,
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	box: belongsTo( "twitchImage", { async: false } ),
	giantbomb_id: attr( "number" ),
	logo: belongsTo( "twitchImage", { async: false } ),
	name: attr( "string" ),
	popularity: attr( "number" ),
	properties: attr()

}).reopenClass({
	toString: function() { return "kraken/games"; }
});
