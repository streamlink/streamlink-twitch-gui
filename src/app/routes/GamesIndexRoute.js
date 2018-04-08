import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshRouteMixin from "./mixins/refresh";
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
			.then( records => toArray( records ) )
			.then( records => preload( records, "game.box.large" ) );
	}
});
