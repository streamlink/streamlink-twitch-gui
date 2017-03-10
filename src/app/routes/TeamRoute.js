import {
	get,
	Route
} from "Ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	model( params ) {
		const store = get( this, "store" );
		const { team } = params;

		return store.findRecord( "twitchTeam", team, { reload: true } )
			.then( preload([ "logo", "banner" ]) );
	}
});
