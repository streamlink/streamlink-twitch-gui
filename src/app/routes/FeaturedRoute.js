import {
	get,
	set,
	Route
} from "Ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	model() {
		let store = get( this, "store" );

		return Promise.all([
			store.queryRecord( "twitchStreamsSummary", {} ),
			store.query( "twitchStreamsFeatured", {
				offset: 0,
				limit : 5
			})
				.then( toArray() )
		])
			.then( ([ summary, featured ]) =>
				Promise.resolve( featured )
					.then( preload([
						"image",
						"stream.preview.large_nocache"
					]) )
					.then( () => ({ summary, featured }) )
			);
	},

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}
});
