import {
	attr,
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	channels: attr( "number" ),
	game: belongsTo( "twitchGameFollowed", { async: false } ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "api/users/:user_name/follows/games/live"; }
});
