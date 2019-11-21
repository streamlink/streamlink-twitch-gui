import { alias, or } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ListItemComponent from "../-list-item/component";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	/** @type {RouterService} */
	router: service(),

	layout,

	classNames: [ "game-item-component" ],

	game: alias( "content.game" ),
	hasStats: or( "content.channels", "content.viewers" ),

	click() {
		this.router.transitionTo( "games.game", this.game.name );
	}
});
