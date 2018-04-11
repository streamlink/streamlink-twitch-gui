import { get } from "@ember/object";
import Route from "@ember/routing/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


export default Route.extend( InfiniteScrollMixin, {
	itemSelector: ".channel-item-component",

	async model() {
		const model = this.modelFor( "team" );

		const offset = get( this, "offset" );
		const limit = get( this, "limit" );

		const channels = get( model, "users" )
			.slice( offset, offset + limit );
		const records = await Promise.all( channels );

		return await preload( records, "logo" );
	}
});
