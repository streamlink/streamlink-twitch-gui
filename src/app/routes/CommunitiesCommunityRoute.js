import {
	get,
	Route
} from "ember";
import RefreshMixin from "./mixins/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshMixin, {
	async model( params ) {
		const store = get( this, "store" );
		const { community_id } = params;

		let record;
		try {
			record = await store.findRecord( "twitchCommunity", community_id, { reload: true } );
		} catch ( e ) {
			record = await store.queryRecord( "twitchCommunity", { name: community_id } );
		}
		await preload( record, "avatar_image_url" );

		return record;
	}
});
