import {
	get,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import RefreshMixin from "./mixins/refresh";
import {
	toArray,
	mapBy
} from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


function filterMatches( filter, value ) {
	return filter === "all" || filter === value;
}


export default Route.extend( InfiniteScrollMixin, RefreshMixin, {
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
		let store = get( this, "store" );

		return Promise.all([
			// search for games
			filterMatches( params.filter, "games" )
				? store.query( "twitchSearchGame", {
					query: params.query,
					type : "suggest",
					live : true
				})
					.then( records => toArray( records ) )
					.then( records => preload( records, "game.box.largeLatest" ) )
				: Promise.resolve( [] ),

			// search for channels
			filterMatches( params.filter, "channels" )
				? store.query( "twitchSearchChannel", {
					query : params.query,
					offset: 0,
					limit : 10
				})
					.then( records => mapBy( records, "channel" ) )
					.then( records => preload( records, "logo" ) )
				: Promise.resolve( [] ),

			// search for streams
			filterMatches( params.filter, "streams" )
				? store.query( "twitchSearchStream", {
					query : params.query,
					offset: get( this, "offset" ),
					limit : get( this, "limit" )
				})
					.then( records => mapBy( records, "stream" ) )
					.then( records => preload( records, "preview.mediumLatest" ) )
				: Promise.resolve( [] )
		])
			.then( ([ games, channels, streams ]) => ({ games, channels, streams }) );
	},

	fetchContent() {
		if ( !filterMatches( get( this, "filter" ), "streams" ) ) {
			return Promise.resolve( [] );
		}

		return get( this, "store" ).query( "twitchSearchStream", {
			query : get( this, "query" ),
			offset: get( this, "offset" ),
			limit : get( this, "limit" )
		})
			.then( records => mapBy( records, "stream" ) )
			.then( records => preload( records, "preview.mediumLatest" ) );
	}
});
