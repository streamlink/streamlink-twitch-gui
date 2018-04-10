import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "routes/mixins/infinite-scroll/offset";
import RefreshRouteMixin from "routes/mixins/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStreamFollowed",
	modelMapBy: "stream",
	modelPreload: "preview.mediumLatest"
});
