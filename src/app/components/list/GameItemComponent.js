import {
	get,
	computed,
	inject
} from "Ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/GameItemComponent.hbs";


const { or } = computed;
const { service } = inject;


export default ListItemComponent.extend({
	routing: service( "-routing" ),

	layout,

	classNames: [ "game-item-component" ],

	game: or( "content.game", "content" ),
	hasStats: or( "content.channels", "content.viewers" ),

	click() {
		let game = get( this, "game.name" );
		get( this, "routing" ).transitionTo( "games.game", game );
	}
});
