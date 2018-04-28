import UserIndexRoute from "../../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameFollowedLive",
	modelPreload: "game.game.box.large"
});
