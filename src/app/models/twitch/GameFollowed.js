import {
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString() { return "api/users/:user_name/follows/games"; }
});
