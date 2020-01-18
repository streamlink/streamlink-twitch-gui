import { A } from "@ember/array";
import UserIndexRoute from "../index/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import { mapBy } from "utils/ember/recordArrayMethods";
import { preload } from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",

	// Guard against infinite API queries in case Twitch's query offset implemention breaks.
	// Assume that nobody has followed so many channels that more than 500 (5*maxLimit) streams
	// are online at the same time.
	maxQueries: 5,

	/**
	 * Twitch doesn't sort the followed streams response anymore:
	 * https://github.com/streamlink/streamlink-twitch-gui/issues/699
	 *
	 * @returns {Promise<TwitchStreamFollowed[]>}
	 */
	async model() {
		const store = this.store;
		const limit = this.maxLimit;

		const maxQueries = this.maxQueries;
		let i = 0;

		const all = A();
		let records;
		let offset = 0;
		do {
			records = await store.query( "twitch-stream-followed", { offset, limit } );
			offset += records.length;
			all.push( ...mapBy( records, "stream" ) );
		} while ( records.length >= limit && ++i <= maxQueries );

		// make sure that no followed stream appears twice between API queries
		this.all = all.uniqBy( "id" );
		// finally sort by viewers locally
		this.all.sort( ( a, b ) => b.viewers - a.viewers );

		// return the first infinite scroll result as initial model data
		return await this.fetchContent();
	},

	/**
	 * @returns {Promise<TwitchStreamFollowed[]>}
	 */
	async fetchContent() {
		const { all, offset, limit } = this;
		const streams = all.slice( offset, offset + limit );
		// let InfiniteScrollMixin know when it has fetched all records
		streams.meta = {
			total: all.length
		};

		return await preload( streams, "preview.mediumLatest" );
	},

	deactivate() {
		this._super( ...arguments );
		this.all = null;
	}
});
