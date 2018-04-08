import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "./mixins/infinite-scroll/offset";
import RefreshRouteMixin from "./mixins/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameTop",
	modelPreload: "game.box.large"
});
