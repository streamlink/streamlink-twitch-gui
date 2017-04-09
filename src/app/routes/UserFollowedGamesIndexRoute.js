import { get } from "ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",

	modelName: "twitchGameFollowedLive",
	preloadPath: "game.game.box.large",

	model() {
		const store = get( this, "store" );
		const offset = get( this, "offset" );
		const limit = get( this, "limit" );

		return store.query( this.modelName, { offset, limit } )
			.then( toArray() )
			.then( preload( this.preloadPath ) );
	}
});
