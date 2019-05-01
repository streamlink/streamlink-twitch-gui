import Route from "@ember/routing/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";


export default class StreamsRoute
extends Route.extend( InfiniteScrollOffsetMixin, FilterLanguagesMixin, RefreshRouteMixin ) {
	itemSelector = ".stream-item-component";
	modelName = "twitch-stream";
	modelPreload = "preview.mediumLatest";
}
