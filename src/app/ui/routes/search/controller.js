import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { alias, empty, equal } from "@ember/object/computed";
import "./styles.less";


export default Controller.extend({
	queryParams: [ "filter", "query" ],

	games   : alias( "model.games" ),
	streams : alias( "model.streams" ),
	channels: alias( "model.channels" ),

	notFiltered: equal( "filter", "all" ),

	emptyGames   : empty( "games" ),
	emptyStreams : empty( "streams" ),
	emptyChannels: empty( "channels" ),

	noResults: computed( "emptyGames", "emptyStreams", "emptyChannels", function() {
		return get( this, "emptyGames" )
		    && get( this, "emptyStreams" )
		    && get( this, "emptyChannels" );
	})
});
