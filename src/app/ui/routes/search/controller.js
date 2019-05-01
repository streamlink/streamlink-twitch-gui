import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { alias, empty, equal } from "@ember/object/computed";
import "./styles.less";


export default class SearchController extends Controller {
	queryParams = [ "filter", "query" ];

	@alias( "model.games" )
	games;
	@alias( "model.streams" )
	streams;
	@alias( "model.channels" )
	channels;

	@equal( "filter", "all" )
	notFiltered;

	@empty( "games" )
	emptyGames;
	@empty( "streams" )
	emptyStreams;
	@empty( "channels" )
	emptyChannels;

	@computed( "emptyGames", "emptyStreams", "emptyChannels" )
	get noResults() {
		return this.emptyGames && this.emptyStreams && this.emptyChannels;
	}
}
