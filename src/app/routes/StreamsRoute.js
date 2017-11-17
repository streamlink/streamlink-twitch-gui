import {
	get,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import FilterLanguagesMixin from "./mixins/filter-languages";
import RefreshMixin from "./mixins/refresh";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, FilterLanguagesMixin, RefreshMixin, {
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
