import {
	get,
	Route
} from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";
import ModelMetadataMixin from "mixins/ModelMetadataMixin";
import toArray from "utils/ember/toArray";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, LanguageFilterMixin, ModelMetadataMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStream",

	model: function() {
		return get( this, "store" ).query( this.modelName, {
			offset              : get( this, "offset" ),
			limit               : get( this, "limit" ),
			broadcaster_language: get( this, "broadcaster_language" )
		})
			.then( toArray )
			.then( preload( "preview.medium_nocache" ) );
	}
});
