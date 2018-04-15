import { get, set } from "@ember/object";
import Mixin from "@ember/object/mixin";
import InfiniteScrollCommonMixin from "./common";


export default Mixin.create( InfiniteScrollCommonMixin, {
	query() {
		const cursor = get( this, "cursor" );
		const limit = get( this, "limit" );

		return { cursor, limit };
	},

	beforeModel() {
		set( this, "cursor", undefined );

		return this._super( ...arguments );
	},

	async model() {
		const records = await this._super( ...arguments );

		const cursor = get( records, "meta.cursor" );
		set( this, "cursor", cursor );

		return records;
	}
});
