import { get, computed } from "@ember/object";
import { or } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


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
