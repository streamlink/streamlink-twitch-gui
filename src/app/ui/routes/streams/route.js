import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "routes/mixins/infinite-scroll/offset";
import FilterLanguagesMixin from "routes/mixins/filter-languages";
import RefreshRouteMixin from "routes/mixins/refresh";


export default Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStream",
	modelPreload: "preview.mediumLatest"
});
