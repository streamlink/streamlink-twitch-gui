import {
	get,
	computed
} from "Ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/GameItemComponent.hbs";


const { or } = computed;


export default ListItemComponent.extend({
	layout,

	classNames: [ "game-item-component" ],

	action: "goto",

	game: or( "content.game", "content" ),
	hasStats: or( "content.channels", "content.viewers" ),

	click: function() {
		this.sendAction( "action", "games.game", get( this, "game.name" ) );
	}
});
