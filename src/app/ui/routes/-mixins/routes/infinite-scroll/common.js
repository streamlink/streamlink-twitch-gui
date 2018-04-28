import { get } from "@ember/object";
import Mixin from "@ember/object/mixin";
import InfiniteScrollMixin from ".";
import { mapBy, toArray } from "utils/ember/recordArrayMethods";
import { preload } from "utils/preload";


export default Mixin.create( InfiniteScrollMixin, {
	modelName: null,
	modelMapBy: null,
	modelPreload: null,

	query() {
		return {};
	},

	async model( params = {} ) {
		const store = get( this, "store" );
		const query = Object.assign( {}, params, this.query() );
		const records = await store.query( this.modelName, query );

		const data = this.modelMapBy
			? mapBy( records, this.modelMapBy )
			: toArray( records );

		return this.modelPreload
			? await preload( data, this.modelPreload )
			: data;
	}
});
