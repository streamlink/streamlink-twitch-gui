import {
	get,
	Route
} from "ember";
import RefreshMixin from "./mixins/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshMixin, {
	model( params ) {
		const store = get( this, "store" );
		const { team } = params;

		return store.findRecord( "twitchTeam", team, { reload: true } )
			.then( preload( "logo" ) );
	}
});
