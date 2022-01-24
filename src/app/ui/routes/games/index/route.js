import UserIndexRoute from "ui/routes/user/index/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default UserIndexRoute.extend( PaginationMixin, RefreshRouteMixin, {
	itemSelector: ".game-item-component",
	modelName: "twitch-game-top",
	modelMapBy: "game",
	modelPreload: "box_art_url.latest"
});
