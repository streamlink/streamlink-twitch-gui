import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "./mixins/infinite-scroll/offset";
import FilterLanguagesMixin from "./mixins/filter-languages";
import RefreshRouteMixin from "./mixins/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest"
});
