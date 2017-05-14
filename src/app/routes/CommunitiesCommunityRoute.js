import {
	get,
	Route
} from "ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	async model( params ) {
		const store = get( this, "store" );
		const { community_id } = params;

		let record;
		try {
			record = await store.findRecord( "twitchCommunity", community_id, { reload: true } );
		} catch ( e ) {
			record = await store.queryRecord( "twitchCommunity", { name: community_id } );
		}
		await preload( "avatar_image_url" )( record );

		return record;
	}
});
