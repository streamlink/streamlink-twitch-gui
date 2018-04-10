import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "routes/mixins/infinite-scroll/offset";
import RefreshRouteMixin from "routes/mixins/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameTop",
	modelPreload: "game.box.large"
});
