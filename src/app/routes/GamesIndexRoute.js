import {
	get,
	Route
} from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import ModelMetadataMixin from "mixins/ModelMetadataMixin";
import toArray from "utils/ember/toArray";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, ModelMetadataMixin, {
	itemSelector: ".game-item-component",

	modelName: "twitchGamesTop",

	model: function() {
		return get( this, "store" ).query( this.modelName, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( toArray )
			.then( preload( "game.box.large" ) );
	}
});
