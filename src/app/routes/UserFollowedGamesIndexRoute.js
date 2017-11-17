import { get } from "ember";
import UserIndexRoute from "./UserIndexRoute";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshMixin from "./mixins/refresh";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshMixin, {
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
