import {
	get,
	Route
} from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, LanguageFilterMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStream",

	model() {
		return get( this, "store" ).query( this.modelName, {
			offset              : get( this, "offset" ),
			limit               : get( this, "limit" ),
			broadcaster_language: get( this, "broadcaster_language" )
		})
			.then( toArray() )
			.then( preload( "preview.mediumLatest" ) );
	}
});
