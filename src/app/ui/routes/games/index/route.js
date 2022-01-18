import Route from "@ember/routing/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default Route.extend( PaginationMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitchGameTop",
	modelPreload: "game.box.large"
});
