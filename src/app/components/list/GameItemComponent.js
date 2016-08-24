import Ember from "Ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/GameItemComponent.hbs";


var get = Ember.get;
var or = Ember.computed.or;


export default ListItemComponent.extend({
	layout: layout,
	classNames: [ "game-item-component" ],

	action: "goto",

	game: or( "content.game", "content" ),
	hasStats: or( "content.channels", "content.viewers" ),

	click: function() {
		this.sendAction( "action", "games.game", get( this, "game.name" ) );
	}
});
