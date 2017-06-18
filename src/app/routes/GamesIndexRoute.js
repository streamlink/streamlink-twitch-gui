import {
	get,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",

	modelName: "twitchGameTop",

	model() {
		return get( this, "store" ).query( this.modelName, {
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( toArray() )
			.then( preload( "game.box.large" ) );
	}
});
