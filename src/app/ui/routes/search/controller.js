import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { alias, empty, equal } from "@ember/object/computed";
import "./styles.less";


export default Controller.extend({
	queryParams: [ "filter", "query" ],

	games   : alias( "model.games" ),
	channels: alias( "model.channels" ),

	notFiltered: equal( "filter", "all" ),

	emptyGames   : empty( "games" ),
	emptyChannels: empty( "channels" ),

	noResults: computed( "emptyGames", "emptyChannels", function() {
		return this.emptyGames && this.emptyChannels;
	})
});
