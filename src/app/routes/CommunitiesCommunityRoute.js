import {
	get,
	set,
	Route
} from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, LanguageFilterMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	contentPath: "controller.model.streams",

	modelName: "twitchStream",

	model( params ) {
		if ( arguments.length > 0 ) {
			set( this, "community_id", params.community_id );
		}

		const store = get( this, "store" );
		const community_id = get( this, "community_id" );

		return Promise.all([
			store.findRecord( "twitchCommunity", community_id, { reload: true } )
				.then( preload( "avatar_image_url" ) ),
			this.fetchContent()
		])
			.then( ([ community, streams ]) => ({ community, streams }) );
	},

	fetchContent() {
		const store = get( this, "store" );
		const offset = get( this, "offset" );
		const limit = get( this, "limit" );
		const broadcaster_language = get( this, "broadcaster_language" );
		const community_id = get( this, "community_id" );

		return store.query( this.modelName, {
			offset,
			limit,
			broadcaster_language,
			community_id
		})
			.then( toArray() )
			.then( preload( "preview.mediumLatest" ) );
	}
});
