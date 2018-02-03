import { get } from "@ember/object";
import Route from "@ember/routing/route";
import RefreshMixin from "./mixins/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshMixin, {
	model( params ) {
		const store = get( this, "store" );
		const { team } = params;

		return store.findRecord( "twitchTeam", team, { reload: true } )
			.then( record => preload( record, "logo" ) );
	}
});
