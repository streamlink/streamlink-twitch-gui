import {
	get,
	set,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, {
	itemSelector: ".stream-item-component",

	model() {
		const store = get( this, "store" );
		const model = this.modelFor( "team" );
		const users = get( model, "users" );
		const overall = get( users, "length" );

		const offset = get( this, "customOffset" ) || 0;
		const limit = get( this, "limit" );

		let offsetCalculated = false;

		const fill = ( streamArray, start ) => {
			const end = start + limit;
			const channels = users.slice( start, end );

			return Promise.all( channels.map( channel =>
				store.findRecord( "twitchStream", get( channel, "id" ), { reload: true } )
					.catch( () => false )
			) )
				.then( toArray() )
				// filter offline streams
				.then( streams => streams.filter( Boolean ) )
				// append to overall list
				.then( streams => streamArray.concat( streams ) )
				// fetch more if necessary
				.then( streams => streams.length >= limit || end >= overall
					? streams
					: fill( streams, end )
				)
				.then( streams => {
					// The InfiniteScrollMixin uses a computed property for calculating the offset.
					// Manually keep track of the offset here...
					if ( !offsetCalculated ) {
						set( this, "customOffset", end );
						offsetCalculated = true;
					}

					return streams;
				});
		};

		return fill( [], offset )
			.then( preload( "preview.mediumLatest" ) );
	},

	reload() {
		set( this, "customOffset", 0 );

		return this._super( ...arguments );
	},

	deactivate() {
		set( this, "customOffset", 0 );

		return this._super( ...arguments );
	}
});
