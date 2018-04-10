import UserIndexRoute from "../../index/route";
import InfiniteScrollOffsetMixin from "routes/mixins/infinite-scroll/offset";
import RefreshRouteMixin from "routes/mixins/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameFollowedLive",
	modelPreload: "game.game.box.large"
});
