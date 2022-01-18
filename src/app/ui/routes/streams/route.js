import Route from "@ember/routing/route";
import PaginationMixin from "ui/routes/-mixins/routes/infinite-scroll/pagination";
import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default Route.extend( PaginationMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest"
});
