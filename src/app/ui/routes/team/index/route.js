import Route from "@ember/routing/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default class TeamIndexRoute extends Route.extend( InfiniteScrollMixin ) {
	itemSelector = ".stream-item-component";

	beforeModel() {
		this.customOffset = 0;

		return super.beforeModel( ...arguments );
	}

	async model() {
		const store = this.store;
		const limit = this.limit;
		const model = this.modelFor( "team" );
		const channels = model.users;
		const length = channels.length;

		let offsetCalculated = false;
		const options = { reload: true };

		const fill = async ( streams, start ) => {
			const end = start + limit;
			const records = await Promise.all( channels
				.slice( start, end )
				.map( channel => store.findRecord( "twitch-stream", channel.id, options )
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
}
