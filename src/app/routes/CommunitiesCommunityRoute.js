import {
	get,
	Route
} from "Ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	model( params ) {
		const store = get( this, "store" );
		const { community_id } = params;

		return store.findRecord( "twitchCommunity", community_id, { reload: true } )
			.then( preload( "avatar_image_url" ) );
	}
});
