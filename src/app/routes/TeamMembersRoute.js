import {
	get,
	Route
} from "ember";
import InfiniteScrollMixin from "./mixins/infinite-scroll";
import { toArray } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, {
	itemSelector: ".channel-item-component",

	model() {
		const model = this.modelFor( "team" );

		const offset = get( this, "offset" );
		const limit = get( this, "limit" );

		const channels = get( model, "users" )
			.slice( offset, offset + limit );

		return Promise.all( channels )
			.then( toArray() )
			.then( records => preload( records, "logo" ) );
	}
});
