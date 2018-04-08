import UserIndexRoute from "./UserIndexRoute";
import InfiniteScrollOffsetMixin from "./mixins/infinite-scroll/offset";
import RefreshRouteMixin from "./mixins/refresh";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStreamFollowed",
	modelMapBy: "stream",
	modelPreload: "preview.mediumLatest"
});
