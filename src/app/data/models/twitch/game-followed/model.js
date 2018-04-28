import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString() { return "api/users/:user_name/follows/games"; }
});
