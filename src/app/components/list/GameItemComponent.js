import {
	get,
	computed,
	inject
} from "ember";
import ListItemComponent from "./ListItemComponent";
import layout from "templates/components/list/GameItemComponent.hbs";


const { or } = computed;
const { service } = inject;


export default ListItemComponent.extend({
	routing: service( "-routing" ),

	layout,

	classNames: [ "game-item-component" ],

	gamePath: "game",
	game: computed( "content", "gamePath", function() {
		let content = get( this, "content" );
		let gamePath = get( this, "gamePath" );

		return get( content, gamePath );
	}),
	hasStats: or( "content.channels", "content.viewers" ),

	click() {
		let game = get( this, "game.name" );
		get( this, "routing" ).transitionTo( "games.game", game );
	}
});
