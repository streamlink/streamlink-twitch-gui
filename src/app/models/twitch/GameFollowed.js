import {
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString() { return "api/users/:user_name/follows/games"; }
});
