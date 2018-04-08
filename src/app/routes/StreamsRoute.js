import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import FilterLanguagesMixin from "./mixins/filter-languages";
import RefreshRouteMixin from "./mixins/refresh";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, FilterLanguagesMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStream",

	model() {
		const store = get( this, "store" );
		const offset = get( this, "offset" );
		const limit = get( this, "limit" );
		const broadcaster_language = get( this, "broadcaster_language" );

		return store.query( this.modelName, { offset, limit, broadcaster_language })
			.then( records => toArray( records ) )
			.then( records => preload( records, "preview.mediumLatest" ) );
	}
});
