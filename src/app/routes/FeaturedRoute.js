import {
	get,
	set,
	RSVP,
	Route
} from "Ember";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend({
	model() {
		var store = get( this, "store" );

		return RSVP.hash({
			summary : store.findAll( "twitchStreamsSummary", { reload: true } )
				.then( toArray() ),
			featured: store.query( "twitchStreamsFeatured", {
				offset: 0,
				limit : 5
			})
				.then( toArray() )
		})
			.then(function( data ) {
				return Promise.resolve( data.featured )
					.then( preload([
						"image",
						"stream.preview.large_nocache"
					]) )
					.then(function() {
						return data;
					});
			});
	},

	resetController( controller, isExiting ) {
		if ( isExiting ) {
			set( controller, "isAnimated", false );
		}
	}
});
