import {
	get,
	set,
	Route
} from "ember";
import RefreshMixin from "./mixins/refresh";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( RefreshMixin, {
	model() {
		let store = get( this, "store" );

		return Promise.all([
			store.queryRecord( "twitchStreamSummary", {} ),
			store.query( "twitchStreamFeatured", {
				offset: 0,
				limit : 5
			})
				.then( records => toArray( records ) )
		])
			.then( ([ summary, featured ]) =>
				Promise.resolve( featured )
					.then( records => preload( records, [
						"image",
						"stream.preview.largeLatest"
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
