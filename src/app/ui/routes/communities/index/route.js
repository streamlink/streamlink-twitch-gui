import Route from "@ember/routing/route";
import InfiniteScrollCursorMixin from "ui/routes/-mixins/routes/infinite-scroll/cursor";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default Route.extend( InfiniteScrollCursorMixin, RefreshRouteMixin, {
	itemSelector: ".community-item-component",
	modelName: "twitchCommunityTop",
	modelPreload: "avatar_image_url"
});
