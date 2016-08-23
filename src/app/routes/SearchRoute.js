import {
	get,
	RSVP,
	Route
} from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import toArray from "utils/ember/toArray";
import mapBy from "utils/ember/mapBy";
import preload from "utils/preload";


function filterMatches( filter, value ) {
	return filter === "all" || filter === value;
}


export default Route.extend( InfiniteScrollMixin, {
	contentPath: "controller.model.streams",

	itemSelector: ".stream-item-component",

	queryParams: {
		filter: {
			refreshModel: true,
			replace: true
		},
		query: {
			refreshModel: true,
			replace: true
		}
	},

	model( params ) {
		var store  = get( this, "store" );

		return RSVP.hash({
			// search for games
			games: filterMatches( params.filter, "games" )
				? store.query( "twitchSearchGame", {
					query: params.query,
					type : "suggest",
					live : true
				})
					.then( toArray )
					.then( mapBy( "game" ) )
					.then( preload( "box.large_nocache" ) )
				: Promise.resolve([]),

			// search for channels
			channels: filterMatches( params.filter, "channels" )
				? store.query( "twitchSearchChannel", {
					query : params.query,
					offset: 0,
					limit : 10
				})
					.then( toArray )
					.then( mapBy( "channel" ) )
					.then( preload( "logo" ) )
				: Promise.resolve([]),

			// search for streams
			streams: filterMatches( params.filter, "streams" )
				? store.query( "twitchSearchStream", {
					query : params.query,
					offset: get( this, "offset" ),
					limit : get( this, "limit" )
				})
					.then( toArray )
					.then( mapBy( "stream" ) )
					.then( preload( "preview.medium_nocache" ) )
				: Promise.resolve([])
		});
	},

	fetchContent() {
		if ( !filterMatches( get( this, "filter" ), "streams" ) ) {
			return Promise.resolve([]);
		}

		return get( this, "store" ).query( "twitchSearchStream", {
			query : get( this, "query" ),
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( toArray )
			.then( mapBy( "stream" ) )
			.then( preload( "preview.medium_nocache" ) );
	}
});
