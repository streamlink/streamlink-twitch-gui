import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, {
	itemSelector: ".stream-item-component",

	beforeModel() {
		this.customOffset = 0;

		return this._super( ...arguments );
	},

	async model() {
		const store = get( this, "store" );
		const limit = get( this, "limit" );
		const model = this.modelFor( "team" );
		const users = get( model, "users" );
		const length = get( users, "length" );

		let offsetCalculated = false;
		const options = { reload: true };

		const fill = async ( streams, start ) => {
			const end = start + limit;
			const records = await Promise.all( users
				.slice( start, end )
				.map( channel => store.findRecord( "twitchStream", get( channel, "id" ), options )
					.catch( () => false )
				)
			);

			// filter offline streams and append to overall list
			streams.push( ...toArray( records ).filter( Boolean ) );

			// fetch more if necessary
			if ( streams.length < limit && end < length ) {
				streams = await fill( streams, end );
			}

			// The InfiniteScrollMixin uses a computed property for calculating the offset.
			// Manually keep track of the offset here...
			if ( !offsetCalculated ) {
				this.customOffset = end;
				offsetCalculated = true;
			}

			return streams;
		};

		const records = await fill( [], this.customOffset );

		return await preload( records, "preview.mediumLatest" );
	}
});
