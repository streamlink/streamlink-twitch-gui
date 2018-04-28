import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameTop",
	modelPreload: "game.box.large"
});
