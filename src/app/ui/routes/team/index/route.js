import UserIndexRoute from "ui/routes/user/index/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, {
	itemSelector: ".stream-item-component",

	beforeModel() {
		this.customOffset = 0;

		return this._super( ...arguments );
	},

	async model() {
		const { /** @type {DS.Store} */ store, /** @type {number} */ limit } = this;
		const { /** @type {string[]} */ users } = this.modelFor( "team" );
		const { length } = users;

		let offsetCalculated = false;
		const options = { reload: true };

		const fill = async ( streams, start ) => {
			const end = start + limit;
			const records = await Promise.all( users
				.slice( start, end )
				.map( async user_id => {
					try {
						const [ stream ] = await Promise.all([
							store.findRecord( "twitch-stream", user_id, options ),
							store.findRecord( "twitch-user", user_id, options ),
							store.findRecord( "twitch-channel", user_id, options )
						]);
						return stream;
					} catch ( e ) {
						return false;
					}
				} )
			);

			// filter offline streams and append to overall list
			streams.push( ...records.filter( Boolean ) );

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

		return await preload( records, "thumbnail_url.latest" );
	}
});
