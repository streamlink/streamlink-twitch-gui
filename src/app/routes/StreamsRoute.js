import {
	get,
	Route
} from "ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, LanguageFilterMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStream",

	model() {
		const store = get( this, "store" );
		const offset = get( this, "offset" );
		const limit = get( this, "limit" );
		const broadcaster_language = get( this, "broadcaster_language" );

		return store.query( this.modelName, { offset, limit, broadcaster_language })
			.then( toArray() )
			.then( preload( "preview.mediumLatest" ) );
	}
});
