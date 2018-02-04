import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	channels: attr( "number" ),
	game: belongsTo( "twitchGameFollowed", { async: false } ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "api/users/:user_name/follows/games/live"; }
});
