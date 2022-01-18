import { get, set } from "@ember/object";
import Mixin from "@ember/object/mixin";
import InfiniteScrollCommonMixin from "ui/routes/-mixins/routes/infinite-scroll/common";


export default Mixin.create( InfiniteScrollCommonMixin, {
	paginationMethod: "after",
	paginationCursor: null,

	calcHasFetchedAll( data ) {
		const hasFetchedAll = !get( data, "meta.pagination.cursor" );
		set( this.controller, "hasFetchedAll", hasFetchedAll );
	},

	query() {
		const query = { first: this.limit };
		if ( this.paginationMethod && this.paginationCursor ) {
			query[ this.paginationMethod ] = this.paginationCursor;
		}

		return query;
	},

	beforeModel() {
		this.paginationCursor = null;

		return this._super( ...arguments );
	},

	async model() {
		const records = await this._super( ...arguments );
		this.paginationCursor = get( records, "meta.pagination.cursor" );

		return records;
	}
});
