import { get } from "@ember/object";
import Mixin from "@ember/object/mixin";
import InfiniteScrollCommonMixin from "./common";


export default Mixin.create( InfiniteScrollCommonMixin, {
	query() {
		const offset = get( this, "offset" );
		const limit = get( this, "limit" );

		return { offset, limit };
	}
});
