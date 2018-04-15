import UserIndexRoute from "./UserIndexRoute";
import InfiniteScrollOffsetMixin from "./mixins/infinite-scroll/offset";
import RefreshRouteMixin from "./mixins/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameFollowedLive",
	modelPreload: "game.game.box.large"
});
